import os
import re

ui_dir = './components/ui'

# Get all tsx files
for filename in os.listdir(ui_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(ui_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove version numbers from imports
        original_content = content
        content = re.sub(r'@radix-ui/([^@\s"\']+)@[\d.]+', r'@radix-ui/\1', content)
        content = re.sub(r'lucide-react@[\d.]+', r'lucide-react', content)
        content = re.sub(r'class-variance-authority@[\d.]+', r'class-variance-authority', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ Fixed: {filename}')
        else:
            print(f'⏭️  Skipped: {filename} (no changes needed)')

print('\n✨ All imports fixed!')
