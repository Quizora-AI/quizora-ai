
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Fixing Android build issues...');

// Ensure directories exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create assets directory for Android
ensureDirExists(path.join(__dirname, 'android/app/src/main/assets'));

// Create a basic index.android.bundle file if it doesn't exist
const bundlePath = path.join(__dirname, 'android/app/src/main/assets/index.android.bundle');
if (!fs.existsSync(bundlePath)) {
  console.log('Creating placeholder bundle file...');
  fs.writeFileSync(bundlePath, '// This is a placeholder bundle file created during the build process', 'utf8');
}

// Ensure the Android Gradle wrapper is executable
try {
  if (fs.existsSync('android/gradlew')) {
    console.log('Making android/gradlew executable...');
    execSync('chmod +x android/gradlew');
  } else {
    console.log('android/gradlew not found. Skipping.');
  }
} catch (error) {
  console.error('Error making gradlew executable:', error.message);
}

// Create a .npmrc file to prevent lockfile issues
fs.writeFileSync('.npmrc', 'legacy-peer-deps=true\nstrict-peer-dependencies=false\n', 'utf8');

console.log('Android build fixes applied successfully');
