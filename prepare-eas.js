#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing project for EAS build...');

// Ensure directories exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Directories to ensure
ensureDirExists(path.join(__dirname, 'android/app/src/main/assets'));
ensureDirExists(path.join(__dirname, 'android/app/src/main/res/raw'));

// Create module declarations to fix TypeScript import errors
const moduleDeclarations = `
declare module 'react' {
  export * from 'react';
  export default React;
}

declare module 'react-dom' {
  export * from 'react-dom';
  export default ReactDOM;
}

declare module 'react-router-dom' {
  export * from 'react-router-dom';
}

declare module 'framer-motion' {
  export * from 'framer-motion';
}

declare module 'recharts' {
  export * from 'recharts';
}

declare module 'lucide-react' {
  export * from 'lucide-react';
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module '*.webp';
`;

// Ensure the types directory exists
ensureDirExists(path.join(__dirname, 'src/types'));

// Write the module declarations
fs.writeFileSync(
  path.join(__dirname, 'src/types/module-declarations.d.ts'),
  moduleDeclarations,
  'utf8'
);

console.log('Module declarations created successfully');

// Create a modified Metro config for better compatibility
const metroConfig = `
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db');
config.resolver.sourceExts.push('mjs', 'js', 'jsx', 'ts', 'tsx', 'json', 'svg', 'png', 'jpg', 'webp');
config.resolver.extraNodeModules = {
  'react-native': require.resolve('react-native-web'),
  'react': require.resolve('react'),
  'react-dom': require.resolve('react-dom'),
  'stream': require.resolve('readable-stream'),
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  }
};

module.exports = config;
`;

// Write the Metro config
fs.writeFileSync(
  path.join(__dirname, 'metro.config.js'),
  metroConfig,
  'utf8'
);

console.log('Metro configuration created successfully');

// Update tsconfig.app.json to fix ESM issues
const tsconfigApp = `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": [],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "files": [
    "src/main.tsx",
    "src/types/module-declarations.d.ts"
  ],
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.tsx",
    "src/**/*.test.tsx"
  ]
}
`;

// Write the tsconfig.app.json
fs.writeFileSync(
  path.join(__dirname, 'tsconfig.app.json'),
  tsconfigApp,
  'utf8'
);

console.log('tsconfig.app.json created successfully');

// Fix the ESM issue in vite.config.ts
const viteConfig = `
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

// Write the vite.config.ts
fs.writeFileSync(
  path.join(__dirname, 'vite.config.ts'),
  viteConfig,
  'utf8'
);

console.log('vite.config.ts updated successfully');

// Create empty bundle file if needed for Android
const bundleFilePath = path.join(__dirname, 'android/app/src/main/assets/index.android.bundle');
if (!fs.existsSync(bundleFilePath)) {
  ensureDirExists(path.dirname(bundleFilePath));
  fs.writeFileSync(bundleFilePath, '// Empty bundle placeholder', 'utf8');
  console.log('Created placeholder bundle file');
}

// Create build directory for Android to fix build issues
const androidBuildDir = path.join(__dirname, 'android/app/build');
ensureDirExists(androidBuildDir);
ensureDirExists(path.join(androidBuildDir, 'generated/assets'));
ensureDirExists(path.join(androidBuildDir, 'intermediates'));

console.log('Project prepared for EAS build successfully!');
console.log('Next steps:');
console.log('1. Run "node make-executable.js" to make scripts executable');
console.log('2. Run "npx eas build --platform android --profile production"');
