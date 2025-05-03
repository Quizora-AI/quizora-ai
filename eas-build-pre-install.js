
#!/usr/bin/env node

console.log('Running EAS Build pre-install script...');
console.log('Setting up build environment...');

// Check if we're in an EAS Build environment
if (process.env.EAS_BUILD === 'true') {
  const fs = require('fs');
  const path = require('path');
  
  console.log('In EAS Build environment, preparing for dependency installation');
  
  // Create a .npmrc file to avoid using frozen lockfile
  try {
    fs.writeFileSync('.npmrc', 'frozen-lockfile=false\n');
    console.log('Created .npmrc file to avoid frozen lockfile issues');
  } catch (error) {
    console.error('Error creating .npmrc file:', error.message);
  }
  
  // Create a .yarnrc file to avoid frozen lockfile for yarn
  try {
    fs.writeFileSync('.yarnrc', '--frozen-lockfile false\n');
    console.log('Created .yarnrc file to avoid frozen lockfile issues');
  } catch (error) {
    console.error('Error creating .yarnrc file:', error.message);
  }
  
  // Create a .bunrc file to avoid frozen lockfile for bun
  try {
    fs.writeFileSync('.bunrc', '{"install": {"frozen": false}}\n');
    console.log('Created .bunrc file to avoid frozen lockfile issues');
  } catch (error) {
    console.error('Error creating .bunrc file:', error.message);
  }
  
  // Modify bunfig.toml if it exists
  try {
    if (fs.existsSync('bunfig.toml')) {
      fs.appendFileSync('bunfig.toml', '\n[install]\nfrozen = false\n');
      console.log('Updated bunfig.toml to disable frozen lockfile');
    } else {
      fs.writeFileSync('bunfig.toml', '[install]\nfrozen = false\n');
      console.log('Created bunfig.toml to disable frozen lockfile');
    }
  } catch (error) {
    console.error('Error updating bunfig.toml:', error.message);
  }
}

console.log('Pre-install script completed');
