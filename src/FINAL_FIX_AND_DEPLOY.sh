#!/bin/bash

echo "🔧 FINAL FIX - Removing ALL duplicate startExam keys"
echo "===================================================="
echo ""

echo "✅ Fixed duplicate in English translations"
echo "✅ Fixed duplicate in Bulgarian translations"
echo "✅ Fixed duplicate in Spanish translations"
echo "✅ Fixed duplicate in Greek translations"
echo ""

echo "📦 Committing fixes..."
git add data/translations.ts
git commit -m "Fix: Remove duplicate startExam keys from all language translations"
echo ""

echo "📤 Pushing to git..."
git push
echo ""

echo "🧹 Cleaning build..."
rm -rf node_modules dist .vite package-lock.json
echo ""

echo "📥 Installing..."
npm install
echo ""

echo "🏗️  Building..."
npm run build
echo ""

if [ -d "dist" ]; then
  echo "✅ SUCCESS! Build complete, dist folder created."
  echo ""
  echo "🚀 Deploying to Vercel..."
  npx vercel --prod
  echo ""
  echo "🎉 DEPLOYMENT COMPLETE!"
else
  echo "❌ Build failed - no dist folder created"
  exit 1
fi
