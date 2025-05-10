
#!/bin/bash

# Script to build Android app bundle (AAB)

echo "Starting Android build process..."

# Navigate to the root directory
cd "$(dirname "$0")/.." || exit

# Generate the bundle file
echo "Generating the bundle file..."
node create-bundle.js

# Navigate back to android directory
cd "$(dirname "$0")" || exit

# Make gradlew executable
chmod +x ./gradlew

# Clean the project
echo "Cleaning the project..."
./gradlew clean

# Add -Xskip-metadata-version-check flag to bypass Kotlin version mismatch errors
echo "Building AAB (Android App Bundle) with Kotlin version check skip..."
./gradlew :app:bundleRelease -Xskip-metadata-version-check

# Check if build was successful
if [ -f ./app/build/outputs/bundle/release/app-release.aab ]; then
  echo "Build successful! AAB file created at: ./app/build/outputs/bundle/release/app-release.aab"
else
  echo "Build failed. Check logs for errors."
  exit 1
fi
