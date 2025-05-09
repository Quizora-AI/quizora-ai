
#!/bin/bash

# Script to generate Android bundle file

echo "Generating Android bundle file..."

# Run the bundle creation script
node create-bundle.js

# Make the script executable if on Unix-like system
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
  chmod +x ./android/gradlew
  echo "Made gradlew executable"
fi

echo "Bundle generation complete!"
