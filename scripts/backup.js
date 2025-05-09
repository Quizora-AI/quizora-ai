
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create SuperBackup directory
const backupDir = path.join(process.cwd(), 'SuperBackup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('Created SuperBackup directory');
}

// Create directory structure in backup
const backupSrcDir = path.join(backupDir, 'src');
const backupAssetsDir = path.join(backupDir, 'assets');
const backupComponentsDir = path.join(backupDir, 'components');

if (!fs.existsSync(backupSrcDir)) {
  fs.mkdirSync(backupSrcDir, { recursive: true });
}
if (!fs.existsSync(backupAssetsDir)) {
  fs.mkdirSync(backupAssetsDir, { recursive: true });
}
if (!fs.existsSync(backupComponentsDir)) {
  fs.mkdirSync(backupComponentsDir, { recursive: true });
}

// Backup config files
const filesToBackup = [
  'package.json',
  'app.json',
  'app.config.js',
  'tsconfig.json',
  'tailwind.config.ts', 
  'vite.config.ts',
  'babel.config.js'
];

filesToBackup.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(backupDir, file));
    console.log(`Backed up ${file}`);
  } else {
    console.log(`${file} does not exist, skipping`);
  }
});

// Backup src folder
if (fs.existsSync('src')) {
  execSync(`cp -R src/* ${backupSrcDir}`);
  console.log('Backed up src folder');
}

// Backup assets folder
if (fs.existsSync('assets')) {
  execSync(`cp -R assets/* ${backupAssetsDir}`);
  console.log('Backed up assets folder');
}

// Backup components folder if it exists at root level
if (fs.existsSync('components')) {
  execSync(`cp -R components/* ${backupComponentsDir}`);
  console.log('Backed up components folder');
}

console.log('Backup completed successfully!');
