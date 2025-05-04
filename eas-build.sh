
#!/bin/bash

echo "=== Quizora AI EAS Build Script ==="
echo "Preparing your app for building..."

# Create .eas-hooks directories
mkdir -p .eas-hooks

# Create pre-install hook
cat > .eas-hooks/pre-install.js << 'EOF'
#!/usr/bin/env node
console.log('Running pre-install hook...');
const fs = require('fs');

try {
  // Create .npmrc to avoid frozen lockfile issues
  fs.writeFileSync('.npmrc', 'legacy-peer-deps=true\nfrozen-lockfile=false\n');
  console.log('Created .npmrc file');
  
  // Create .yarnrc
  fs.writeFileSync('.yarnrc', '--frozen-lockfile false\n--network-timeout 300000\n');
  console.log('Created .yarnrc file');
} catch (error) {
  console.error('Error in pre-install hook:', error);
  // Don't exit with error to allow build to continue
}
EOF

# Create post-install hook
cat > .eas-hooks/post-install.js << 'EOF'
#!/usr/bin/env node
console.log('Running post-install hook...');

const fs = require('fs');
const path = require('path');

try {
  // Ensure android/build.gradle exists
  const androidBuildGradlePath = path.join(process.cwd(), 'android', 'build.gradle');
  if (!fs.existsSync(path.dirname(androidBuildGradlePath))) {
    fs.mkdirSync(path.dirname(androidBuildGradlePath), { recursive: true });
  }
  
  // Create build.gradle with proper configuration
  const buildGradleContent = `// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath("com.android.tools.build:gradle:8.1.3")
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.8.0")
  }
}

def reactNativeAndroidDir = new File(
  providers.exec {
    workingDir(rootDir)
    commandLine("node", "--print", "require.resolve('react-native/package.json')")
  }.standardOutput.asText.get().trim(),
  "../android"
)

allprojects {
  repositories {
    maven {
      // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
      url(reactNativeAndroidDir)
    }

    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}

apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
`;

  fs.writeFileSync(androidBuildGradlePath, buildGradleContent);
  console.log('Created android/build.gradle file');
  
  // Make script files executable
  const scriptPaths = [
    '.eas-hooks/pre-install.js',
    '.eas-hooks/post-install.js',
  ];
  
  scriptPaths.forEach(scriptPath => {
    try {
      fs.chmodSync(scriptPath, '755');
      console.log(`Made ${scriptPath} executable`);
    } catch (error) {
      console.error(`Failed to make ${scriptPath} executable:`, error);
    }
  });
} catch (error) {
  console.error('Error in post-install hook:', error);
  // Don't exit with error to allow build to continue
}
EOF

# Make the hook scripts executable
chmod +x .eas-hooks/pre-install.js
chmod +x .eas-hooks/post-install.js

echo "Installing dependencies..."
npm install --no-frozen-lockfile

echo "Building app using EAS..."
echo "Choose build type:"
echo "1) Development build"
echo "2) Preview build (generates APK)"
echo "3) Production build"
read -p "Select option (1-3): " build_option

case $build_option in
  1)
    echo "Starting development build..."
    npx eas build --platform android --profile development
    ;;
  2)
    echo "Starting preview build (APK)..."
    npx eas build --platform android --profile preview
    ;;
  3)
    echo "Starting production build..."
    npx eas build --platform android --profile production
    ;;
  *)
    echo "Invalid option. Using preview build (APK)..."
    npx eas build --platform android --profile preview
    ;;
esac

echo "Build process initiated! Follow the instructions in the terminal."
