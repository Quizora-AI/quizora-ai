
#!/bin/bash

# Make all EAS-related scripts executable
chmod +x eas-build-pre-install.js
chmod +x eas-build-post-install.js
chmod +x eas-build-on-success.js
chmod +x prepare-eas.js
chmod +x fix-android-build.js

# Ensure Android gradlew is executable
if [ -f "android/gradlew" ]; then
  chmod +x android/gradlew
fi

# Run the fix-android-build script
node fix-android-build.js

echo "EAS build environment prepared successfully"
echo "You can now run: npx eas build --platform android --profile production"
