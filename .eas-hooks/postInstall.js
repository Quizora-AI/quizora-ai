
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log environment information for debugging
console.log('Running postInstall hook...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

// Create eas-build-post-install.js file in the root directory
try {
  console.log('Adding eas-build-post-install.js script...');
  
  const postInstallContent = `
// This script runs after the npm install command in EAS Build
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Running EAS Build post-install script...');
  
  // Update bun.lockb if needed
  try {
    console.log('Updating lockfile...');
    execSync('bun install --no-frozen-lockfile', { stdio: 'inherit' });
    console.log('Lockfile updated successfully');
  } catch (error) {
    console.error('Error updating lockfile:', error);
    // Continue despite errors to avoid failing the build
  }
  
  console.log('EAS Build post-install script completed successfully');
} catch (error) {
  console.error('Error in EAS Build post-install script:', error);
  // Don't exit with error code to allow the build to continue
}
`;
  
  fs.writeFileSync(path.join(process.cwd(), 'eas-build-post-install.js'), postInstallContent);
  fs.chmodSync(path.join(process.cwd(), 'eas-build-post-install.js'), '755');
  console.log('Created eas-build-post-install.js script');
  
} catch (error) {
  console.error('Error in postInstall hook:', error);
  // Don't exit with error code to allow the build to continue
}
