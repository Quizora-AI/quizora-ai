
#!/usr/bin/env node

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
}
