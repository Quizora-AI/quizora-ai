
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Setting up a fresh project environment...');

// Create .npmrc file to avoid using frozen lockfile
const fs = require('fs');
fs.writeFileSync('.npmrc', `
frozen-lockfile=false
legacy-peer-deps=true
auto-install-peers=true
`);

try {
  // Install dependencies with npm
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Configure EAS
  console.log('Configuring EAS...');
  execSync('npx eas-cli build:configure', { stdio: 'inherit' });
  
  console.log('Setup complete! Your project has been cleaned and reinstalled.');
} catch (error) {
  console.error('Error during setup:', error.message);
  process.exit(1);
}
