#!/bin/bash

# Fix package.json
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
['dependencies','devDependencies','peerDependencies'].forEach(s => {
  if (!p[s]) return;
  const c = {};
  Object.entries(p[s]).forEach(([k,v]) => {
    if (!/@\d+\.\d+/.test(k)) c[k] = v;
  });
  p[s] = c;
});
['readme','_id','pnpm'].forEach(f => delete p[f]);
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
console.log('✅ package.json cleaned');
"

# Fix versioned imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' "s/from '\(.*\)@[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*'/from '\1'/g"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' 's/from "\(.*\)@[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*"/from "\1"/g'
echo "✅ Imports cleaned"

# Install, build, commit, deploy
npm install && npm run build && git add -A && git commit -m "fix: clean package and imports" && git push origin main && vercel --prod
