#!/bin/bash

# Yacht Exam Trainer - Backend Deployment Script
# This script deploys your Supabase Edge Functions

echo "🚀 Deploying Yacht Exam Trainer Backend..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    echo ""
    echo "Please run ONE of these commands based on your system:"
    echo ""
    echo "macOS:     brew install supabase/tap/supabase"
    echo "Windows:   scoop install supabase"
    echo "npm:       npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "Running: supabase login"
    echo ""
    supabase login
fi

echo "✅ Logged in to Supabase"
echo ""

# Link to project
echo "🔗 Linking to your Supabase project..."
PROJECT_ID="abtrsjhvjfgcxxpkszwi"

supabase link --project-ref $PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project"
    exit 1
fi

echo "✅ Project linked"
echo ""

# Set secrets (only if not already set)
echo "🔐 Configuring secrets..."
echo ""
echo "⚠️  You will be prompted to set/update secrets."
echo "    Press Enter to keep existing values or paste new ones."
echo ""

# These are already set according to the system, so we'll just verify
echo "The following secrets should already be configured:"
echo "  ✅ SUPABASE_URL"
echo "  ✅ SUPABASE_ANON_KEY"
echo "  ✅ SUPABASE_SERVICE_ROLE_KEY"
echo "  ✅ SUPABASE_DB_URL"
echo "  ✅ STRIPE_SECRET_KEY"
echo ""

# Set ADMIN_IMPORT_KEY (user should set this)
echo "Setting ADMIN_IMPORT_KEY for question imports..."
read -p "Enter your admin import key (choose a secure password): " ADMIN_KEY

if [ -z "$ADMIN_KEY" ]; then
    echo "⚠️  Using default key (change this in production!)"
    ADMIN_KEY="change-this-key-$(date +%s)"
fi

supabase secrets set ADMIN_IMPORT_KEY="$ADMIN_KEY"

echo ""
echo "✅ Secrets configured"
echo ""

# Deploy functions
echo "🚀 Deploying Edge Functions..."
echo ""

supabase functions deploy server

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "📍 Your API endpoint:"
echo "   https://$PROJECT_ID.supabase.co/functions/v1/make-server-d36f8f91/"
echo ""
echo "🔑 Your Admin Import Key: $ADMIN_KEY"
echo "   (Save this - you'll need it to import questions)"
echo ""
echo "Next steps:"
echo "  1. Deploy frontend (run ./deploy-frontend.sh)"
echo "  2. Configure Stripe webhook (see QUICK_START.md)"
echo "  3. Import your questions via Admin Panel"
echo ""
