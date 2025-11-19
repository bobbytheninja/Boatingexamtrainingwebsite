#!/bin/bash

# Yacht Exam Trainer - GitHub Setup Script
# This script initializes git and pushes to GitHub

echo "📦 Setting up GitHub repository..."
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ GitHub username required"
    exit 1
fi

# Get repository name
read -p "Enter repository name (default: yacht-exam-trainer): " REPO_NAME
REPO_NAME=${REPO_NAME:-yacht-exam-trainer}

echo ""
echo "Configuration:"
echo "  GitHub User: $GITHUB_USER"
echo "  Repository: $REPO_NAME"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "🔧 Initializing git repository..."

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
build/
.next/
out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Supabase
.supabase/

# Temporary files
*.tmp
.temp/
EOF
    echo "✅ Created .gitignore"
fi

# Initialize git if needed
if [ ! -d .git ]; then
    git init
    echo "✅ Initialized git repository"
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo ""
echo "📝 Adding files to git..."
git add .

# Commit
echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit - Yacht Exam Training Platform

Features:
- User authentication with Supabase
- 5 exam categories (jet ski, small boat, big boat, yacht, navigation)
- Payment integration with Stripe
- Question database with CSV import
- Admin panel for user and question management
- Responsive design with dark mode
- Multi-language support (English, Bulgarian, Spanish, Greek)
"

if [ $? -ne 0 ]; then
    echo "⚠️  Commit failed or no changes to commit"
fi

# Add remote
echo ""
echo "🔗 Adding GitHub remote..."
REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

git remote add origin $REMOTE_URL

echo "✅ Remote added: $REMOTE_URL"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo ""
echo "⚠️  IMPORTANT: Create the repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo "   Make it Private (recommended)"
echo "   DON'T initialize with README"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " CREATED

if [ "$CREATED" != "y" ]; then
    echo ""
    echo "Please create the repository first, then run:"
    echo "  git push -u origin main"
    echo ""
    exit 0
fi

# Rename branch to main if needed
git branch -M main

# Push
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "📍 Your repository:"
    echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Go to https://vercel.com"
    echo "  2. Click 'New Project'"
    echo "  3. Import your GitHub repository"
    echo "  4. Add environment variables (see below)"
    echo "  5. Deploy!"
    echo ""
    echo "Environment variables for Vercel:"
    echo "  VITE_SUPABASE_URL=https://abtrsjhvjfgcxxpkszwi.supabase.co"
    echo "  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw"
    echo "  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "  1. Repository doesn't exist on GitHub"
    echo "  2. Authentication required (try: git push -u origin main)"
    echo "  3. Wrong repository name"
    echo ""
    echo "Manual push command:"
    echo "  git push -u origin main"
    echo ""
fi
