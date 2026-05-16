import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
  if (!pkg[section]) continue;
  const clean = {};
  for (const [key, value] of Object.entries(pkg[section])) {
    if (/@\d+\.\d+/.test(key)) continue;
    clean[key] = value;
  }
  pkg[section] = clean;
}

delete pkg.readme;
delete pkg._id;
delete pkg.pnpm;

writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Done! package.json is clean.');
