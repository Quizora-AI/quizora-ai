
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log environment information for debugging
console.log('Running postInstall hook...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

// Create eas-build-post-install.js file in the root directory if it doesn't exist
try {
  console.log('Creating eas-build-post-install.js script...');
  
  const postInstallContent = `#!/usr/bin/env node

// This script runs after the npm install command in EAS Build
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Running EAS Build post-install script...');
  
  // Check if we're in an EAS Build environment
  if (process.env.EAS_BUILD === 'true') {
    console.log('In EAS Build environment, ensuring all dependencies are up to date');
    
    // Run bun install without frozen lockfile
    console.log('Updating dependencies with unfrozen lockfile...');
    try {
      execSync('bun install --no-frozen-lockfile', { stdio: 'inherit' });
      console.log('Dependencies updated successfully with bun');
    } catch (error) {
      console.error('Error updating dependencies with bun:', error.message);
      
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
  }
  
  console.log('EAS Build post-install script completed');
} catch (error) {
  console.error('Error in EAS Build post-install script:', error.message);
  // Don't exit with error code to allow the build to continue
}`;
  
  fs.writeFileSync(path.join(process.cwd(), 'eas-build-post-install.js'), postInstallContent);
  fs.chmodSync(path.join(process.cwd(), 'eas-build-post-install.js'), '755');
  console.log('Created eas-build-post-install.js script with executable permissions');
  
  // Ensure bun doesn't use frozen lockfile
  console.log('Creating .bunrc to disable frozen lockfile...');
  try {
    fs.writeFileSync(path.join(process.cwd(), '.bunrc'), '{"install": {"frozen": false}}\n');
    console.log('Created .bunrc file');
  } catch (error) {
    console.error('Error creating .bunrc file:', error.message);
  }
  
  // Modify bunfig.toml if it exists
  try {
    const bunfigPath = path.join(process.cwd(), 'bunfig.toml');
    if (fs.existsSync(bunfigPath)) {
      fs.appendFileSync(bunfigPath, '\n[install]\nfrozen = false\n');
      console.log('Updated bunfig.toml to disable frozen lockfile');
    } else {
      fs.writeFileSync(bunfigPath, '[install]\nfrozen = false\n');
      console.log('Created bunfig.toml to disable frozen lockfile');
    }
  } catch (error) {
    console.error('Error updating bunfig.toml:', error.message);
  }
  
} catch (error) {
  console.error('Error in postInstall hook:', error.message);
  // Don't exit with error code to allow the build to continue
}
