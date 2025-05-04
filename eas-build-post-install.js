
#!/usr/bin/env node

// This script runs after the npm install command in EAS Build
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Running EAS Build post-install script...');
  
  // Check if we're in an EAS Build environment
  if (process.env.EAS_BUILD === 'true') {
    console.log('In EAS Build environment, ensuring all dependencies are up to date');
    
    // Create type declaration file for module resolution
    const typesDir = path.join(process.cwd(), 'src/types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    const declarationsPath = path.join(typesDir, 'global.d.ts');
    const declarations = `
declare module 'react-native' {
  export * from 'react-native-web';
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}
`;
    fs.writeFileSync(declarationsPath, declarations);
    console.log('Created type declarations in src/types/global.d.ts');
    
    // Fix package.json to use compatible versions of dependencies
    try {
      const pkgJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        
        // Remove problematic specific version of @react-native/gradle-plugin
        if (pkgJson.devDependencies && pkgJson.devDependencies['@react-native/gradle-plugin']) {
          delete pkgJson.devDependencies['@react-native/gradle-plugin'];
          console.log('Removed specific version of @react-native/gradle-plugin from devDependencies');
        }
        
        if (pkgJson.dependencies && pkgJson.dependencies['@react-native/gradle-plugin']) {
          delete pkgJson.dependencies['@react-native/gradle-plugin'];
          console.log('Removed specific version of @react-native/gradle-plugin from dependencies');
        }
        
        // Add the latest compatible version
        if (!pkgJson.devDependencies) {
          pkgJson.devDependencies = {};
        }
        
        // Write the updated package.json
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
        console.log('Updated package.json to fix dependency issues');
        
        // Try to install dependencies again with fixed package.json
        console.log('Installing dependencies with fixed package.json...');
        try {
          execSync('bun install --no-frozen-lockfile', { stdio: 'inherit' });
          console.log('Dependencies installed successfully with bun');
        } catch (error) {
          console.error('Error installing dependencies with bun:', error.message);
          
          // Fallback to npm if bun fails
          console.log('Trying npm as fallback...');
          try {
            execSync('npm install --no-package-lock', { stdio: 'inherit' });
            console.log('Fallback to npm succeeded');
          } catch (npmError) {
            console.error('Npm fallback also failed:', npmError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error updating package.json:', error.message);
    }
    
    // Create tsconfig.json if it doesn't exist
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      const tsconfig = {
        "extends": "./tsconfig.app.json",
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@/*": ["./src/*"]
          },
          "jsx": "react-jsx",
          "lib": ["DOM", "DOM.Iterable", "ESNext"],
          "module": "ESNext",
          "moduleResolution": "bundler",
          "resolveJsonModule": true,
          "target": "ESNext",
          "allowSyntheticDefaultImports": true,
          "esModuleInterop": true
        },
        "include": ["src", "src/**/*.ts", "src/**/*.tsx", "src/types/**/*.d.ts"],
        "exclude": ["node_modules"]
      };
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      console.log('Created tsconfig.json');
    }
  }
  
  console.log('EAS Build post-install script completed');
} catch (error) {
  console.error('Error in EAS Build post-install script:', error.message);
  // Don't exit with error code to allow the build to continue
}
