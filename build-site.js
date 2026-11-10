const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'website');
const targets = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'public')
];

for (const target of targets) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  fs.cpSync(srcDir, target, { recursive: true });
  console.log(`Copied website files to ${target}`);
}

console.log('dimis website build completed successfully!');
