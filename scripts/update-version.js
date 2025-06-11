const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const versionFile = path.join(__dirname, '../core/src/version.mts');

const content = `export const VERSION = '${packageJson.version}';\n`;
fs.writeFileSync(versionFile, content);
console.log(`Version updated to ${packageJson.version} in ${versionFile}`);