# 🚀 DEPLOY YOUR BACKEND NOW

## Why the Admin Panel Breaks

Your admin panel is breaking because **the backend has never been deployed**. The frontend is trying to call API endpoints that don't exist yet:

- ❌ `/check-admin` endpoint → doesn't exist
- ❌ `/questions` endpoint → doesn't exist  
- ❌ `/subscriptions` endpoint → doesn't exist
- ❌ All other API routes → don't exist

**I just fixed the admin panel** to show a proper error message instead of crashing, but you still need to deploy the backend to make everything work!

## Quick Deploy Steps

### Step 1: Install Supabase CLI (if not installed)

**Choose ONE based on your system:**

```bash
# macOS
brew install supabase/tap/supabase

# Windows with scoop
scoop install supabase

# Or use npm (any system)
npm install -g supabase
```

### Step 2: Run the Deployment Script

**On macOS/Linux:**
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

**On Windows:**
```bash
deploy-backend.bat
```

### Step 3: Set Your Admin Import Key

When prompted, enter a secure password like:
```
YachtExam2024!SecureKey
```

**⚠️ SAVE THIS PASSWORD!** You'll need it to import questions in the Admin Panel.

### Step 4: Wait for Deployment

The script will:
1. ✅ Check if you're logged in to Supabase
2. ✅ Link to your project (ID: `abtrsjhvjfgcxxpkszwi`)
3. ✅ Set the admin import key secret
4. ✅ Deploy all Edge Functions

This takes about 1-2 minutes.

## What Happens After Deployment?

Once deployed, your backend will be live at:
```
https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/
```

**All these endpoints will work:**
- ✅ `POST /signup` - Create new users
- ✅ `GET /check-admin` - Check if user is admin
- ✅ `POST /grant-admin` - Grant admin access
- ✅ `GET /questions` - Get exam questions
- ✅ `POST /questions/import` - Import questions from CSV
- ✅ `POST /subscriptions` - Create/manage subscriptions
- ✅ `GET /user-subscriptions` - Check user subscriptions
- ✅ `POST /create-checkout-session` - Stripe payment
- ✅ `POST /webhook` - Stripe webhook handler

## Testing After Deployment

1. **Refresh your app** in the browser
2. **Open the Admin Panel** - you should now see a loading spinner, then the full admin interface
3. **Test the connection** - Go to the "Test Auth" tab and click "Test Server Connection"
4. **Grant yourself admin access** - Use the "API Keys" tab to make yourself an admin
5. **Import questions** - Use the "Import Questions" tab with your admin key

## Troubleshooting

### "Supabase CLI not found"
- Run the install command for your system above
- Make sure it's in your PATH
- Try opening a new terminal window

### "Not logged in to Supabase"
- The script will automatically run `supabase login`
- Follow the prompts to authenticate
- You may need to open a browser to complete login

### "Failed to link project"
- Make sure you have access to project `abtrsjhvjfgcxxpkszwi`
- Check your Supabase dashboard
- You may need to accept a project invitation

### "Deployment failed"
- Check if you have the right permissions
- Make sure the Supabase CLI is up to date: `npm update -g supabase`
- Check the error message for specific issues

## Current Status

✅ **Frontend:** Deployed and working  
✅ **Database:** Setup complete with KV store  
✅ **Stripe:** API key configured  
✅ **Admin Panel:** Fixed to handle missing backend gracefully  
❌ **Backend API:** **NOT DEPLOYED** ← **THIS IS WHAT YOU NEED TO DO NOW**

## Ready?

Open your terminal and run:

**macOS/Linux:**
```bash
./deploy-backend.sh
```

**Windows:**
```bash
deploy-backend.bat
```

That's it! The script handles everything else automatically. 🚀
