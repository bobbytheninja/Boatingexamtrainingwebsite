#!/bin/bash

# Yacht Exam Trainer - Backend Deployment Script
# This deploys your Supabase Edge Functions to fix the question import error

echo "🚀 Deploying Yacht Exam Trainer Backend..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    echo ""
    echo "Installing via Homebrew (Mac)..."
    brew install supabase/tap/supabase
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Installation failed"
        echo ""
        echo "Please install manually:"
        echo "  brew install supabase/tap/supabase"
        echo ""
        echo "If you don't have Homebrew, install it first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        exit 1
    fi
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Opening browser to log in..."
    echo "Please complete the login in your browser, then return here."
    echo ""
    supabase login
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Login failed"
        exit 1
    fi
fi

echo "✅ Logged in to Supabase"
echo ""

# Link to project
echo "🔗 Linking to your Supabase project..."
PROJECT_ID="abtrsjhvjfgcxxpkszwi"

# Check if already linked
if [ -f .supabase/config.toml ]; then
    echo "⚠️  Project already linked, relinking..."
    supabase link --project-ref $PROJECT_ID --password $(openssl rand -base64 32)
else
    supabase link --project-ref $PROJECT_ID
fi

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to link project"
    echo ""
    echo "Common issues:"
    echo "  1. Wrong project ID"
    echo "  2. No access to project"
    echo "  3. Database password needed"
    echo ""
    echo "Try manually:"
    echo "  supabase link --project-ref $PROJECT_ID"
    echo ""
    exit 1
fi

echo "✅ Project linked"
echo ""

# Navigate to correct directory structure
if [ -f "src/App.tsx" ]; then
    echo "📁 Detected Vite project structure"
    # Supabase functions should be at root level
    if [ ! -d "supabase/functions" ]; then
        echo "❌ No supabase/functions directory found"
        echo ""
        echo "Expected structure:"
        echo "  ./supabase/functions/server/index.tsx"
        echo ""
        exit 1
    fi
fi

# Deploy functions
echo "🚀 Deploying Edge Functions..."
echo ""
echo "Deploying the 'server' function..."
echo ""

supabase functions deploy server --no-verify-jwt

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Common issues:"
    echo "  1. Missing supabase/functions/server directory"
    echo "  2. Invalid TypeScript in index.tsx"
    echo "  3. Network/connection issue"
    echo ""
    echo "Check your files:"
    echo "  ls -la supabase/functions/server/"
    echo ""
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backend deployed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Your API endpoint:"
echo "   https://$PROJECT_ID.supabase.co/functions/v1/make-server-d36f8f91/"
echo ""
echo "🔥 This fixes your 'Network error: Error importing questions' issue!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Deploy frontend: ./deploy-frontend.sh"
echo "2. Test question import in Admin Panel"
echo "3. Configure Stripe webhook (if using payments)"
echo ""
