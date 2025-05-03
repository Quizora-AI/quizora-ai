
#!/usr/bin/env node

console.log('Running EAS Build pre-install script...');
console.log('Setting up build environment...');

// Check if we're in an EAS Build environment
if (process.env.EAS_BUILD === 'true') {
  const fs = require('fs');
  
  console.log('In EAS Build environment, preparing for dependency installation');
  
  // Create a .npmrc file to avoid using frozen lockfile
  try {
    fs.writeFileSync('.npmrc', 'frozen-lockfile=false\n');
    console.log('Created .npmrc file to avoid frozen lockfile issues');
  } catch (error) {
    console.error('Error creating .npmrc file:', error.message);
  }
  
  // EAS Build uses yarn by default for Expo projects, create a .yarnrc file too
  try {
    fs.writeFileSync('.yarnrc', '--frozen-lockfile false\n');
    console.log('Created .yarnrc file to avoid frozen lockfile issues');
  } catch (error) {
    console.error('Error creating .yarnrc file:', error.message);
  }
}

console.log('Pre-install script completed');
