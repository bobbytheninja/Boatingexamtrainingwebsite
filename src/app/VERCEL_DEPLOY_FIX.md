# Vercel Deployment Fix - Complete Guide

## Problem Solved
The "No Output Directory named 'dist' found" error has been fixed with the following changes:

### Changes Made:

1. **Created `.vercelignore`** - Prevents unnecessary files from being uploaded to Vercel
2. **Updated `vercel.json`** - Added proper SPA routing configuration and version 2 spec
3. **Created `.gitignore`** - Ensures build artifacts aren't committed to git
4. **Added clean script** - Helps clear cache issues

---

## Local Environment Fix (for npm cache corruption)

### Step 1: Clean Everything
```bash
# Remove all build artifacts and cache
rm -rf node_modules
rm -rf dist
rm -rf .vite
rm package-lock.json

# On Windows, use:
# rmdir /s /q node_modules
# rmdir /s /q dist
# del package-lock.json
```

### Step 2: Fresh Install
```bash
npm install
```

### Step 3: Test Build Locally
```bash
npm run build
```

This should create a `dist` folder with:
- `index.html`
- `assets/` folder with JS and CSS files

### Step 4: Preview Build Locally
```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

---

## Vercel Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# First deployment (creates new project)
vercel

# Or for production deployment
vercel --prod
```

The CLI will:
1. Detect your Vite project automatically
2. Ask for project name confirmation
3. Build your app
4. Deploy it
5. Give you a URL

---

### Option 2: Deploy via Vercel Dashboard

#### Step 1: Commit and Push to Git
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

#### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect the Vite framework
4. Click "Deploy"

**Important**: Vercel will use the settings from `vercel.json` automatically.

---

## Environment Variables Setup

After deployment, you need to add environment variables in Vercel:

### Step 1: Go to Project Settings
1. Open your project in Vercel Dashboard
2. Click "Settings" tab
3. Click "Environment Variables"

### Step 2: Add These Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Step 3: Redeploy
After adding environment variables, go to "Deployments" tab and click "Redeploy" on the latest deployment.

---

## Troubleshooting

### Build Still Fails?

#### 1. Check Build Logs
Look at the Vercel deployment logs for specific errors. Common issues:

**TypeScript errors:**
```bash
# Run locally to see errors
npm run type-check
```

**Missing dependencies:**
```bash
# Ensure all dependencies are in package.json
npm install
```

#### 2. Clear Vercel Cache
In Vercel Dashboard:
1. Go to your project
2. Settings > General
3. Scroll to "Build & Development Settings"
4. Click "Clear Build Cache"
5. Redeploy

#### 3. Verify Build Command
The build command should be exactly:
```
npm run build
```

And the output directory should be:
```
dist
```

These are already configured in `vercel.json`.

---

## Deployment Checklist

Before deploying, verify:

- [ ] Local build works: `npm run build` succeeds
- [ ] Preview works: `npm run preview` shows the app correctly
- [ ] Environment variables are ready
- [ ] Git repository is up to date
- [ ] `.gitignore` excludes `node_modules` and `dist`
- [ ] `vercel.json` is committed to repository

---

## What Changed in vercel.json

```json
{
  "version": 2,  // Added: Specifies Vercel config version
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [  // Added: SPA routing support
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [  // Added: Asset caching
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

The key additions:
1. **`version: 2`** - Uses Vercel's build system v2
2. **`rewrites`** - Routes all requests to index.html (critical for React Router)
3. **`headers`** - Optimizes asset caching for better performance

---

## Next Steps After Deployment

1. **Test the live site thoroughly**
   - Login/Signup
   - Mock exams
   - Payment flow
   - Admin panel

2. **Set up custom domain** (optional)
   - Go to Vercel project > Settings > Domains
   - Add your custom domain
   - Configure DNS records as shown

3. **Monitor performance**
   - Check Vercel Analytics
   - Monitor build times
   - Watch for errors in Vercel logs

---

## Need Help?

If deployment still fails:
1. Share the exact error message from Vercel build logs
2. Verify the `dist` folder is created locally when you run `npm run build`
3. Check that all imports in your code are correct (especially the xlsx static import)

---

## Success! 🎉

Once deployed, your yacht exam training app will be live at:
- Production: `https://your-project.vercel.app`
- Or your custom domain if configured

The app will auto-deploy on every push to your main branch!
