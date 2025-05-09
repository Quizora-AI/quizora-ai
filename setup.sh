
#!/bin/bash

# Make scripts executable
chmod +x scripts/backup.js
chmod +x scripts/cleanup.js
chmod +x scripts/install.js

# Run backup first
echo "Backing up essential files..."
node scripts/backup.js

# Run cleanup script
echo "Cleaning up build files and configurations..."
node scripts/cleanup.js

# Run install script
echo "Setting up fresh environment..."
node scripts/install.js

echo "Setup complete! Your project has been backed up, cleaned, and reinstalled."
