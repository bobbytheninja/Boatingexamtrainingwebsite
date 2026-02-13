const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');

// Get all .tsx files
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove all version numbers from imports
  content = content.replace(/@radix-ui\/([^@\s"']+)@[\d.]+/g, '@radix-ui/$1');
  content = content.replace(/lucide-react@[\d.]+/g, 'lucide-react');
  content = content.replace(/class-variance-authority@[\d.]+/g, 'class-variance-authority');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${file}`);
});

console.log('\n✨ All imports fixed!');
