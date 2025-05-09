
#!/bin/bash

# Script to build Android app bundle (AAB)

echo "Starting Android build process..."

# Navigate to the root directory
cd "$(dirname "$0")/.." || exit

# Generate the bundle file
node create-bundle.js

# Navigate back to android directory
cd "$(dirname "$0")" || exit

# Make gradlew executable
chmod +x ./gradlew

# Clean the project
./gradlew clean

# Build AAB (Android App Bundle)
./gradlew :app:bundleRelease

# Check if build was successful
if [ -f ./app/build/outputs/bundle/release/app-release.aab ]; then
  echo "Build successful! AAB file created at: ./app/build/outputs/bundle/release/app-release.aab"
else
  echo "Build failed. Check logs for errors."
  exit 1
fi
