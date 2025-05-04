
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const files = [
  'eas-build-pre-install.js',
  'eas-build-post-install.js',
  '.eas-hooks/postInstall.js',
  'eas-build-on-success.js',
  'eas.sh',
  'make-executable.js'
];

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      console.log(`Making ${file} executable...`);
      execSync(`chmod +x ${file}`);
      console.log(`Made ${file} executable`);
    } else {
      console.log(`File ${file} does not exist, skipping`);
    }
  } catch (error) {
    console.error(`Error making ${file} executable:`, error.message);
  }
});

console.log('All files processed');
