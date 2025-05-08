
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const files = [
  'eas-build-pre-install.js',
  'eas-build-post-install.js',
  '.eas-hooks/postInstall.js',
  'eas-build-on-success.js',
  'prepare-eas.js',
  'eas.sh',
  'make-executable.js',
  'gradlew',
  'android/gradlew'
];

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      console.log(`Making ${file} executable...`);
      execSync(`chmod +x ${file}`);
      console.log(`Made ${file} executable`);
    } else {
      console.log(`File ${file} does not exist, skipping`);
    }
  } catch (error) {
    console.error(`Error making ${file} executable:`, error.message);
  }
});

// Ensure Android Gradle wrapper is executable
try {
  if (fs.existsSync('android/gradlew')) {
    console.log('Making android/gradlew executable...');
    execSync('chmod +x android/gradlew');
    console.log('Made android/gradlew executable');
  } else {
    console.log('android/gradlew does not exist, copying from project root if available');
    if (fs.existsSync('gradlew')) {
      ensureDirExists('android');
      fs.copyFileSync('gradlew', 'android/gradlew');
      execSync('chmod +x android/gradlew');
      console.log('Copied and made android/gradlew executable');
    }
  }
} catch (error) {
  console.error('Error setting up android/gradlew:', error.message);
}

// Helper function to ensure directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log('All files processed');
