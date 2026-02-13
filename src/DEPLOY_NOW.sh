#!/bin/bash

echo "🔧 FIXING ALL ISSUES FOR VERCEL DEPLOYMENT"
echo "=========================================="
echo ""

echo "✅ Fixed: Tailwind v4 → v3.4.1"
echo "✅ Fixed: Duplicate 'startExam' key in translations"
echo ""

echo "📦 Step 1: Committing fixes to git..."
git add package.json styles/globals.css tailwind.config.js data/translations.ts
git commit -m "Fix: Tailwind v3.4.1 + remove duplicate startExam key"
echo ""

echo "📤 Step 2: Pushing to remote..."
git push
echo ""

echo "🧹 Step 3: Cleaning local build..."
rm -rf node_modules dist .vite package-lock.json
echo ""

echo "📥 Step 4: Installing dependencies..."
npm install
echo ""

echo "🏗️  Step 5: Building locally..."
npm run build
echo ""

if [ -d "dist" ]; then
  echo "✅ Build successful! dist folder created."
  echo ""
  echo "🚀 Step 6: Deploying to Vercel..."
  npx vercel --prod
else
  echo "❌ Build failed! No dist folder found."
  echo "Check the error messages above."
  exit 1
fi
