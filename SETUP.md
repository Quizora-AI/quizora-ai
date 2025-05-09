
# Project Reset & Setup

This directory contains scripts to reset your project's build system and configuration.

## What these scripts do

1. **backup.js**: Creates a `/SuperBackup` folder and backs up essential files and directories.
2. **cleanup.js**: Removes all build-related files, configurations, and cleans up legacy build systems.
3. **install.js**: Sets up a fresh environment with clean configurations and reinstalls dependencies.

## How to use

Run the setup script:

```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

Or run the scripts individually:

```bash
# Run backup first
node scripts/backup.js

# Then clean up the project
node scripts/cleanup.js

# Finally install fresh dependencies
node scripts/install.js
```

## After running the scripts

1. Your essential files are backed up in the `/SuperBackup` folder.
2. All build-related files have been removed.
3. A fresh `eas.json` has been created.
4. TypeScript and Vite configurations have been optimized.

## Starting fresh

To start the development server:

```bash
npm start
# or
npx expo start
```

To create a new build:

```bash
npx eas build --platform android
# or
npx eas build --platform ios
```
