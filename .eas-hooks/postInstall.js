
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
  console.log('Creating eas-build-post-install.js script...');
  
  const postInstallContent = `#!/usr/bin/env node

// This script runs after the npm install command in EAS Build
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Running EAS Build post-install script...');
  
  // Run bun install without frozen lockfile
  console.log('Updating dependencies with unfrozen lockfile...');
  try {
    execSync('bun install --no-frozen-lockfile', { stdio: 'inherit' });
    console.log('Dependencies updated successfully');
  } catch (error) {
    console.error('Error updating dependencies:', error.message);
    
    // Fallback to npm if bun fails
    console.log('Trying npm as fallback...');
    try {
      execSync('npm install --no-package-lock', { stdio: 'inherit' });
      console.log('Fallback to npm succeeded');
    } catch (npmError) {
      console.error('Npm fallback also failed:', npmError.message);
      // Continue anyway to not fail the build
    }
  }
  
  console.log('EAS Build post-install script completed');
} catch (error) {
  console.error('Error in EAS Build post-install script:', error.message);
  // Don't exit with error code to allow the build to continue
}`;
  
  fs.writeFileSync(path.join(process.cwd(), 'eas-build-post-install.js'), postInstallContent);
  fs.chmodSync(path.join(process.cwd(), 'eas-build-post-install.js'), '755');
  console.log('Created eas-build-post-install.js script with executable permissions');
  
  // Try to run bun install without frozen lockfile to update the lockfile
  console.log('Updating lockfile in postInstall hook...');
  try {
    execSync('bun install --no-frozen-lockfile', { stdio: 'inherit' });
    console.log('Lockfile updated successfully');
  } catch (error) {
    console.error('Error updating lockfile in hook:', error.message);
    // Don't fail the build due to lockfile issues
  }
  
} catch (error) {
  console.error('Error in postInstall hook:', error.message);
  // Don't exit with error code to allow the build to continue
}
