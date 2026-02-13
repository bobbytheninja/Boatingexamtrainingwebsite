#!/bin/bash

echo "🔧 FIXING NPM PERMISSIONS + DEPLOYING"
echo "======================================"
echo ""

echo "Step 1: Fixing npm cache permissions..."
sudo chown -R 501:20 "/Users/bobbygramatikov/.npm"
echo ""

echo "Step 2: Committing translation fixes..."
git add data/translations.ts package.json styles/globals.css tailwind.config.js
git commit -m "Fix: Remove duplicate startExam + Tailwind v3.4.1"
echo ""

echo "Step 3: Removing package-lock.json from git (has cached Tailwind v4)..."
git rm -f package-lock.json
echo "package-lock.json" >> .gitignore
git add .gitignore
git commit -m "Fix: Remove package-lock.json from git to clear Tailwind v4 cache"
echo ""

echo "Step 4: Pushing to git..."
git push
echo ""

echo "Step 5: Cleaning local build..."
rm -rf node_modules dist .vite package-lock.json
echo ""

echo "Step 6: Fresh install..."
npm install
echo ""

echo "Step 7: Building..."
npm run build
echo ""

if [ -d "dist" ]; then
  echo "✅ SUCCESS! Build complete."
  echo ""
  echo "Step 8: Deploying to Vercel..."
  npx vercel --prod
  echo ""
  echo "🎉 DEPLOYMENT COMPLETE!"
else
  echo "❌ Build failed - no dist folder"
  exit 1
fi
