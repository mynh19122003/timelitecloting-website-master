/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const pkgDir = path.join(__dirname, '..', 'node_modules', 'lightningcss', 'pkg');

try {
  fs.mkdirSync(pkgDir, { recursive: true });

  const cjs = `// Compatibility CJS shim that forwards to the lightningcss-wasm package\ntry {\n  module.exports = require('lightningcss-wasm');\n} catch (err) {\n  throw err;\n}\n`;

  const mjs = `// Compatibility ESM shim that forwards to the lightningcss-wasm package\nexport * from 'lightningcss-wasm';\nimport def from 'lightningcss-wasm';\nexport default def;\n`;

  fs.writeFileSync(path.join(pkgDir, 'index.cjs'), cjs, 'utf8');
  fs.writeFileSync(path.join(pkgDir, 'index.mjs'), mjs, 'utf8');

  console.log('lightningcss postinstall shim written to', pkgDir);
} catch (err) {
  console.error('Failed to write lightningcss postinstall shim:', err);
  process.exitCode = 0; // don't fail installs
}
