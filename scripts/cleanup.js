#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deep cleanup of build-related files...');

// Function to safely delete a file or directory
function safeDelete(pathToDelete) {
  try {
    if (fs.existsSync(pathToDelete)) {
      if (fs.lstatSync(pathToDelete).isDirectory()) {
        fs.rmSync(pathToDelete, { recursive: true, force: true });
      } else {
        fs.unlinkSync(pathToDelete);
      }
      console.log(`Deleted: ${pathToDelete}`);
      return true;
    }
  } catch (error) {
    console.error(`Error deleting ${pathToDelete}: ${error.message}`);
  }
  return false;
}

// List of paths to delete
const pathsToDelete = [
  // Build folders
  '.gradle',
  '.expo',
  '.expo-shared',
  'node_modules',
  '.idea',
  'android',
  'ios',
  '.github',
  '.gitlab',
  '.vscode/launch.json',
  
  // Build files
  'gradlew',
  'gradlew.bat',
  'gradle.properties',
  'settings.gradle',
  'build.gradle',
  'android/build.gradle',
  'android/app/build.gradle',
  
  // EAS related
  '.eas-hooks',
  'eas.json',
  'eas-build-pre-install.js',
  'eas-build-post-install.js',
  'eas-build-on-success.js',
  'eas-chmod.js',
  'fix-android-build.js',
  'prepare-eas.js',
  
  // Lock files
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  
  // Other junk files
  '.DS_Store'
];

// Delete each path in the list
pathsToDelete.forEach(safeDelete);

// Find and delete all build.gradle files recursively
function findAndDeleteGradleFiles(dir) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findAndDeleteGradleFiles(fullPath);
    } else if (entry.name === 'build.gradle' || entry.name.endsWith('.lock')) {
      safeDelete(fullPath);
    }
  }
}

findAndDeleteGradleFiles('.');

// Create a minimal .gitignore to avoid tracking build files in the future
const gitIgnoreContent = `# Build
/node_modules
/.pnp
.pnp.js
/.expo/
/dist/
/build/
/android/
/ios/
/coverage/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Dependencies
/node_modules
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
npm-debug.*
yarn-debug.*
yarn-error.*
.pnpm-debug.log*

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb

# Environment & IDE
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.DS_Store
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

fs.writeFileSync('.gitignore', gitIgnoreContent);
console.log('Created new .gitignore file');

// Empty out the .git/hooks directory to remove any related hooks
const gitHooksDir = path.join('.git', 'hooks');
if (fs.existsSync(gitHooksDir)) {
  fs.readdirSync(gitHooksDir).forEach(file => {
    const filePath = path.join(gitHooksDir, file);
    if (!file.endsWith('.sample') && fs.lstatSync(filePath).isFile()) {
      safeDelete(filePath);
    }
  });
  console.log('Cleaned .git/hooks directory');
}

// Create a minimal, clean eas.json for fresh setup
const easJsonContent = {
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
};

fs.writeFileSync('eas.json', JSON.stringify(easJsonContent, null, 2));
console.log('Created fresh eas.json file');

// Create a minimal tsconfig.json for TypeScript support
const tsConfigContent = {
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js"
  ]
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfigContent, null, 2));
console.log('Created optimized tsconfig.json file');

// Create a clean vite.config.ts file that doesn't depend on lovable-tagger
const viteConfigContent = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs';

// Ensure .well-known directory exists
const wellKnownDir = path.resolve(__dirname, 'public/.well-known');
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-native": "react-native-web"
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.vue']
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // Keep .well-known files in their original location
          if (assetInfo.name && assetInfo.name.includes('.well-known')) {
            return assetInfo.name;
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    copyPublicDir: true
  },
  publicDir: 'public',
  define: {
    'process.env.CORDOVA_ENVIRONMENT': JSON.stringify(true)
  }
}));
`;

fs.writeFileSync('vite.config.ts', viteConfigContent);
console.log('Created clean vite.config.ts file');

// Create a simple metro.config.js for React Native compatibility
const metroConfigContent = `
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
`;

fs.writeFileSync('metro.config.js', metroConfigContent);
console.log('Created simple metro.config.js file');

// Create module declaration file to fix TypeScript errors
const moduleDeclarationsDir = path.join('src', 'types');
if (!fs.existsSync(moduleDeclarationsDir)) {
  fs.mkdirSync(moduleDeclarationsDir, { recursive: true });
}

const moduleDeclarationsContent = `
declare module 'react-native' {
  export * from 'react-native-web';
}

declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

declare module 'lucide-react' {
  import * as LucideReact from 'lucide-react';
  export * from 'lucide-react';
}

declare module 'framer-motion' {
  import * as FramerMotion from 'framer-motion';
  export * from 'framer-motion';
}

declare module 'recharts' {
  import * as Recharts from 'recharts';
  export * from 'recharts';
}

declare module 'react-router-dom' {
  import * as ReactRouterDom from 'react-router-dom';
  export * from 'react-router-dom';
}

declare module '@hookform/resolvers/zod' {
  import * as ZodResolver from '@hookform/resolvers/zod';
  export * from '@hookform/resolvers/zod';
}

declare module 'react-hook-form' {
  import * as ReactHookForm from 'react-hook-form';
  export * from 'react-hook-form';
}

declare module 'zod' {
  import * as Zod from 'zod';
  export * from 'zod';
}

declare module 'date-fns' {
  import * as DateFns from 'date-fns';
  export * from 'date-fns';
}
`;

fs.writeFileSync(path.join(moduleDeclarationsDir, 'module-declarations.d.ts'), moduleDeclarationsContent);
console.log('Created module declarations file to fix TypeScript errors');

console.log('Cleanup complete!');
