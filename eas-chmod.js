
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
console.log('Running postInstall hook...');
// This script is executed after npm install in EAS Build
`);
}

const scriptPaths = [
  '.eas-hooks/postInstall.js',
  'eas-build-post-install.js',
  'eas-build-pre-install.js',
  'eas-build-on-success.js',
  'eas.sh'
];

// Make sure all scripts exist
scriptPaths.forEach(scriptPath => {
  if (!fs.existsSync(scriptPath)) {
    console.log(`Creating empty ${scriptPath}...`);
    fs.writeFileSync(scriptPath, `#!/usr/bin/env node
console.log('Running ${path.basename(scriptPath, '.js')}...');
`);
  }
});

// Set executable permissions
scriptPaths.forEach(scriptPath => {
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
});

console.log('Finished setting permissions on EAS build scripts');
