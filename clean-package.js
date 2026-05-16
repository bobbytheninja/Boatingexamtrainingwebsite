#!/usr/bin/env node

// clean-package.js
// Automatically removes duplicate/invalid entries Figma adds to package.json

import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

let cleaned = 0;

for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
  if (!pkg[section]) continue;
  
  const clean = {};
  for (const [key, value] of Object.entries(pkg[section])) {
    // Skip keys with @version in them e.g. "sonner@2.0.3" or "@emotion/react@11.14.0"
    if (/@\d+\.\d+/.test(key)) {
      console.log(`🗑  Removing invalid entry: "${key}"`);
      cleaned++;
      continue;
    }
    // Skip npm: alias entries e.g. "npm:sonner@2.0.3"
    if (typeof value === 'string' && value.startsWith('npm:') && value.includes('@', 4)) {
      // Only skip if the key itself is already listed cleanly
      if (clean[key]) {
        console.log(`🗑  Removing duplicate npm alias: "${key}"`);
        cleaned++;
        continue;
      }
    }
    clean[key] = value;
  }
  pkg[section] = clean;
}

// Remove stray fields Figma sometimes adds
for (const field of ['readme', '_id', 'pnpm']) {
  if (pkg[field]) {
    console.log(`🗑  Removing stray field: "${field}"`);
    delete pkg[field];
    cleaned++;
  }
}

writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');

if (cleaned > 0) {
  console.log(`\n✅ Cleaned ${cleaned} invalid entries from package.json`);
} else {
  console.log('✅ package.json is already clean!');
}
