#!/bin/bash

# Yacht Exam Trainer - Frontend Deployment Helper
# This guides you through deploying to Vercel to get your live website URL

echo "🌐 Yacht Exam Trainer - Frontend Deployment"
echo ""
echo "This will help you get your website live with a public URL!"
echo ""

# Check if code is in git
if [ ! -d .git ]; then
    echo "⚠️  Git repository not initialized"
    echo ""
    echo "Please initialize git first:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git branch -M main"
    echo "  git remote add origin YOUR_GITHUB_REPO_URL"
    echo "  git push -u origin main"
    echo ""
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠️  You have uncommitted changes"
    echo ""
    read -p "Do you want to commit and push now? (y/n): " COMMIT
    
    if [ "$COMMIT" = "y" ]; then
        echo ""
        read -p "Enter commit message (or press Enter for default): " MESSAGE
        MESSAGE=${MESSAGE:-"Update before deployment"}
        
        git add .
        git commit -m "$MESSAGE"
        git push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Changes pushed to GitHub"
        else
            echo ""
            echo "❌ Push failed. Please push manually:"
            echo "  git push"
            echo ""
            exit 1
        fi
    else
        echo ""
        echo "Please commit and push your changes first, then run this script again."
        echo ""
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 VERCEL DEPLOYMENT (Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Vercel is the easiest way to deploy your Vite/React app."
echo "It takes 5 minutes and gives you a free live URL!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP-BY-STEP INSTRUCTIONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Go to: https://vercel.com"
echo ""
echo "2️⃣  Click 'Sign Up' and use your GitHub account"
echo ""
echo "3️⃣  Click 'Add New' → 'Project'"
echo ""
echo "4️⃣  Import your GitHub repository (grant access if needed)"
echo ""
echo "5️⃣  Configure your project:"
echo "    - Framework Preset: Vite (should auto-detect)"
echo "    - Root Directory: ./"
echo "    - Build Command: npm run build"
echo "    - Output Directory: dist"
echo ""
echo "6️⃣  Add Environment Variables (IMPORTANT!):"
echo ""
echo "    Click 'Environment Variables' and add these 3:"
echo ""
echo "    ┌─────────────────────────────────────────────────────┐"
echo "    │ Name:  VITE_SUPABASE_URL                            │"
echo "    │ Value: https://abtrsjhvjfgcxxpkszwi.supabase.co     │"
echo "    └─────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─────────────────────────────────────────────────────┐"
echo "    │ Name:  VITE_SUPABASE_ANON_KEY                       │"
echo "    │ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M │"
echo "    │        iOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3 │"
echo "    │        h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nj │"
echo "    │        IwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3 │"
echo "    │        b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw            │"
echo "    └─────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─────────────────────────────────────────────────────┐"
echo "    │ Name:  VITE_STRIPE_PUBLISHABLE_KEY                  │"
echo "    │ Value: pk_test_YOUR_STRIPE_KEY_HERE                 │"
echo "    │        (Get this from: https://dashboard.stripe.com)│"
echo "    └─────────────────────────────────────────────────────┘"
echo ""
echo "7️⃣  Click 'Deploy' and wait 2-3 minutes ⏳"
echo ""
echo "8️⃣  You'll get a live URL like:"
echo "    https://yacht-exam-trainer.vercel.app ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 COPY THESE VALUES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "VITE_SUPABASE_URL:"
echo "https://abtrsjhvjfgcxxpkszwi.supabase.co"
echo ""
echo "VITE_SUPABASE_ANON_KEY:"
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw"
echo ""
echo "VITE_STRIPE_PUBLISHABLE_KEY:"
echo "pk_test_YOUR_KEY_FROM_STRIPE_DASHBOARD"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 START HERE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👉 https://vercel.com/new"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After deployment, don't forget to:"
echo ""
echo "✅ Configure Supabase Auth redirect URLs:"
echo "   - Go to Supabase Dashboard → Authentication → URL Configuration"
echo "   - Add your Vercel URL to 'Site URL' and 'Redirect URLs'"
echo ""
echo "✅ Make yourself an admin:"
echo "   - Run the SQL in 'make-admin.sql' in Supabase SQL Editor"
echo "   - Replace 'your-email@example.com' with your actual email"
echo ""
echo "✅ Test your live site and import questions!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment guide complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Optional: Open Vercel in browser
read -p "Open Vercel in browser now? (y/n): " OPEN_BROWSER

if [ "$OPEN_BROWSER" = "y" ]; then
    if command -v open &> /dev/null; then
        open "https://vercel.com/new"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/new"
    else
        echo "Please open manually: https://vercel.com/new"
    fi
fi

echo ""
