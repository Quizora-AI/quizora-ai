#!/usr/bin/env node

// This script makes sure all our EAS build scripts are executable
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Create the .eas-hooks directory if it doesn't exist
const easHooksDir = path.join(process.cwd(), '.eas-hooks');
if (!fs.existsSync(easHooksDir)) {
  console.log('Creating .eas-hooks directory...');
  fs.mkdirSync(easHooksDir, { recursive: true });
}

// Create the postInstall.js file in .eas-hooks if it doesn't exist
const postInstallPath = path.join(easHooksDir, 'postInstall.js');
if (!fs.existsSync(postInstallPath)) {
  console.log('Creating .eas-hooks/postInstall.js...');
  fs.writeFileSync(postInstallPath, `#!/usr/bin/env node
console.log('Running .eas-hooks postInstall hook...');
// This script is executed after npm install in EAS Build

const fs = require('fs');
const path = require('path');

// Ensure all our scripts are in place and executable
try {
  // Create bunfig.toml to disable frozen lockfile
  fs.writeFileSync(path.join(process.cwd(), 'bunfig.toml'), '[install]\\nfrozen = false\\n');
  console.log('Created bunfig.toml to disable frozen lockfile');
  
  // Create .bunrc to disable frozen lockfile
  fs.writeFileSync(path.join(process.cwd(), '.bunrc'), '{"install": {"frozen": false}}\\n');
  console.log('Created .bunrc file');
} catch (error) {
  console.error('Error in postInstall hook:', error.message);
}
`);
}

const scriptPaths = [
  '.eas-hooks/postInstall.js',
  'eas-build-pre-install.js',
  'eas-build-post-install.js',
  'eas-build-on-success.js',
  'eas-chmod.js',
  'eas.sh'
];

// Make sure all scripts exist
scriptPaths.forEach(scriptPath => {
  try {
    if (!fs.existsSync(scriptPath)) {
      console.log(`Script ${scriptPath} doesn't exist, creating placeholder...`);
      fs.writeFileSync(scriptPath, `#!/usr/bin/env node
console.log('Running ${path.basename(scriptPath, '.js')}...');
`);
    }
  } catch (error) {
    console.error(`Error checking/creating ${scriptPath}:`, error);
  }
});

// Set executable permissions
scriptPaths.forEach(scriptPath => {
  try {
    if (fs.existsSync(scriptPath)) {
      console.log(`Making ${scriptPath} executable...`);
      if (process.platform !== 'win32') {
        // chmod +x for Unix-like platforms
        execSync(`chmod +x ${scriptPath}`);
      }
      console.log(`Successfully made ${scriptPath} executable`);
    } else {
      console.error(`Script ${scriptPath} does not exist`);
    }
  } catch (error) {
    console.error(`Failed to make ${scriptPath} executable:`, error.message);
  }
});

console.log('Finished setting permissions on EAS build scripts');
