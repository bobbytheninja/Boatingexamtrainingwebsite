#!/bin/bash

echo "🔧 FIXING VERCEL NPM CACHE ISSUE"
echo "=================================="
echo ""

echo "The problem: package-lock.json in git has Tailwind v4 cached"
echo "The solution: Delete package-lock.json and let npm regenerate it"
echo ""

echo "Step 1: Removing package-lock.json from git..."
git rm -f package-lock.json 2>/dev/null || rm -f package-lock.json
echo ""

echo "Step 2: Adding .gitignore entry..."
echo "package-lock.json" >> .gitignore
echo ""

echo "Step 3: Regenerating clean package-lock.json..."
rm -rf node_modules
npm install
echo ""

echo "Step 4: Committing changes..."
git add .gitignore package.json data/translations.ts
git commit -m "Fix: Remove package-lock.json and fix duplicate translations"
echo ""

echo "Step 5: Pushing to trigger fresh Vercel build..."
git push
echo ""

echo "✅ Done! Vercel will now install packages fresh without the cached Tailwind v4"
echo ""
echo "🚀 Go to Vercel dashboard and redeploy, or wait for auto-deploy"
