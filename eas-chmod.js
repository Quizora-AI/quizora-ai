
#!/usr/bin/env node

// This script makes sure all our EAS build scripts are executable
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPaths = [
  '.eas-hooks/postInstall.js',
  'eas-build-post-install.js',
  'eas-build-pre-install.js',
  'eas-build-on-success.js'
];

scriptPaths.forEach(scriptPath => {
  if (fs.existsSync(scriptPath)) {
    try {
      console.log(`Making ${scriptPath} executable...`);
      if (process.platform !== 'win32') {
        // chmod +x for Unix-like platforms
        execSync(`chmod +x ${scriptPath}`);
      }
      console.log(`Successfully made ${scriptPath} executable`);
    } catch (error) {
      console.error(`Failed to make ${scriptPath} executable:`, error.message);
    }
  } else {
    console.log(`Script ${scriptPath} does not exist, skipping`);
  }
});

console.log('Finished setting permissions on EAS build scripts');
