#!/bin/bash

# Backend Deployment Script
# Run this to deploy your backend to Supabase

echo "🚀 Deploying Backend to Supabase..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    echo ""
fi

# Login to Supabase
echo "🔐 Step 1: Logging in to Supabase..."
npx supabase login

if [ $? -ne 0 ]; then
    echo "❌ Login failed! Please try again."
    exit 1
fi

echo ""
echo "🔗 Step 2: Linking to project..."
npx supabase link --project-ref abtrsjhvjfgcxxpkszwi

echo ""
echo "📤 Step 3: Deploying server function..."
npx supabase functions deploy server --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🧪 Testing backend health..."
    sleep 2
    
    # Test health endpoint
    HEALTH_RESPONSE=$(curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw" \
        https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health)
    
    if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
        echo "✅ Backend is healthy!"
        echo ""
        echo "🎉 All done! Your backend is now running."
        echo ""
        echo "📋 Next steps:"
        echo "  1. Open diagnose-backend.html in your browser to verify"
        echo "  2. Try logging in to your app"
        echo "  3. Set up Stripe keys (see FINISH_PAYMENT_TODAY.md)"
    else
        echo "⚠️ Backend deployed but health check returned:"
        echo "$HEALTH_RESPONSE"
        echo ""
        echo "📋 Troubleshooting:"
        echo "  1. Wait 30 seconds for function to warm up"
        echo "  2. Check logs: npx supabase functions logs server"
        echo "  3. Open diagnose-backend.html for detailed tests"
    fi
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "📋 Troubleshooting:"
    echo "  1. Check your internet connection"
    echo "  2. Make sure you're logged in: npx supabase login"
    echo "  3. Try with debug: npx supabase functions deploy server --no-verify-jwt --debug"
    echo "  4. Check the error message above for details"
fi

echo ""
