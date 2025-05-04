
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Making eas-build.sh executable...');
  fs.chmodSync('eas-build.sh', '755');
  console.log('Script is now executable');
  
  // Create directories for eas hooks
  if (!fs.existsSync('.eas-hooks')) {
    fs.mkdirSync('.eas-hooks', { recursive: true });
  }
  
  console.log('Setup complete. Run ./eas-build.sh to build the app.');
} catch (error) {
  console.error('Error making script executable:', error);
  console.log('If you are on Windows, you can build using: "npx eas build --platform android --profile preview"');
}
