
#!/usr/bin/env bash

# This script ensures all EAS build directories and scripts are properly set up

# Create .eas-hooks directory if it doesn't exist
mkdir -p .eas-hooks

# Make all scripts executable
chmod +x .eas-hooks/postInstall.js
chmod +x eas-build-pre-install.js
chmod +x eas-build-post-install.js
chmod +x eas-build-on-success.js
chmod +x eas-chmod.js

echo "EAS build environment setup complete"
