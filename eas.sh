
#!/bin/bash

# This script ensures all EAS build directories and scripts are properly set up

# Create .eas-hooks directory if it doesn't exist
mkdir -p .eas-hooks

# Create empty script files if they don't exist
touch .eas-hooks/postInstall.js
touch eas-build-pre-install.js
touch eas-build-post-install.js
touch eas-build-on-success.js
touch eas-chmod.js

# Make all scripts executable
chmod +x .eas-hooks/postInstall.js
chmod +x eas-build-pre-install.js
chmod +x eas-build-post-install.js
chmod +x eas-build-on-success.js
chmod +x eas-chmod.js
chmod +x eas.sh

echo "EAS build environment setup complete"
