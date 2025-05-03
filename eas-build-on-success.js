
#!/usr/bin/env node

console.log('EAS Build completed successfully');
console.log('You can now find your build artifacts in the EAS dashboard');

// Report build success details
const fs = require('fs');
const path = require('path');

try {
  const buildInfo = {
    date: new Date().toISOString(),
    platform: process.env.EAS_BUILD_PLATFORM || 'unknown',
    profile: process.env.EAS_BUILD_PROFILE || 'unknown',
    buildId: process.env.EAS_BUILD_ID || 'unknown'
  };
  
  console.log('Build completed with info:', JSON.stringify(buildInfo, null, 2));
  
  // If in EAS Build environment, we could save this info to a file for reference
  if (process.env.EAS_BUILD === 'true') {
    const artifactsDir = process.env.EAS_BUILD_ARTIFACTS_PATH;
    if (artifactsDir && fs.existsSync(artifactsDir)) {
      fs.writeFileSync(
        path.join(artifactsDir, 'build-info.json'), 
        JSON.stringify(buildInfo, null, 2)
      );
      console.log('Saved build info to artifacts directory');
    }
  }
} catch (error) {
  console.error('Error in on-success script:', error.message);
}
