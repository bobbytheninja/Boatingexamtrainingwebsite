# Deployment Fix Steps

## Step 1: Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables and add these:

### Required Variables:
1. **VITE_SUPABASE_URL**
   - Value: Your Supabase project URL (format: `https://xxxxx.supabase.co`)
   - Environment: Production, Preview, Development (check all 3)

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key
   - Environment: Production, Preview, Development (check all 3)

3. **VITE_STRIPE_PUBLISHABLE_KEY**
   - Value: Your Stripe publishable key (starts with `pk_`)
   - Environment: Production, Preview, Development (check all 3)

### Where to find these values:
- **Supabase**: Go to your Supabase project → Settings → API
  - Project URL = VITE_SUPABASE_URL
  - anon public key = VITE_SUPABASE_ANON_KEY

- **Stripe**: Go to Stripe Dashboard → Developers → API keys
  - Publishable key = VITE_STRIPE_PUBLISHABLE_KEY

## Step 2: Commit and Push Changes

Run these commands in your terminal:

```bash
# Check what files need to be committed
git status

# Add the new files
git add .vercelignore .npmrc tsconfig.json

# Commit the changes
git commit -m "fix: exclude supabase directory from Vercel build"

# Push to GitHub
git push
```

## Step 3: Vercel Will Auto-Deploy

Once you push, Vercel should automatically trigger a new deployment.

## If It Still Fails

Try deleting the Vercel project and reconnecting it:
1. In Vercel: Settings → Delete Project
2. Create new project and import from GitHub again
3. Make sure to add all environment variables when setting it up
