# 🚀 Deploy Your Site NOW - Simple 3-Step Guide

Your Supabase backend is already configured! Follow these 3 simple steps to get online.

---

## ✅ **What's Already Done:**

- ✅ Supabase project created (ID: `abtrsjhvjfgcxxpkszwi`)
- ✅ Backend code complete
- ✅ Database configured
- ✅ Authentication system ready

---

## 📋 **What You Need:**

Before starting, make sure you have:

1. **Stripe Publishable Key** (for payments)
   - If you don't have one: Go to https://stripe.com → Sign up → Developers → API Keys
   - Copy the **Publishable key** (starts with `pk_test_`)

2. **GitHub username** (to store code)
   - If you don't have one: Go to https://github.com → Sign up

3. **Admin import key** (any secure password you choose)
   - Example: `MySecure2024Pass!`
   - You'll use this to import questions later

---

## 🎯 **3-Step Deployment:**

### **STEP 1: Deploy Backend (5 minutes)**

#### On Mac/Linux:
```bash
# Make script executable
chmod +x deploy-backend.sh

# Run deployment
./deploy-backend.sh
```

#### On Windows:
```bash
# Just double-click this file or run:
deploy-backend.bat
```

**What it does:**
- Installs Supabase CLI (if needed)
- Connects to your Supabase project
- Asks for your admin import key
- Deploys the server functions

**You'll be asked:**
- `Enter your admin import key` → Type a secure password (save it!)

---

### **STEP 2: Push to GitHub (5 minutes)**

#### On Mac/Linux:
```bash
# Make script executable
chmod +x setup-github.sh

# Run setup
./setup-github.sh
```

#### On Windows:
```bash
# Initialize git manually
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repo (create it first on github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/yacht-exam-trainer.git
git branch -M main
git push -u origin main
```

**You'll be asked:**
- Your GitHub username
- Repository name (default: `yacht-exam-trainer`)

**Before pushing:**
- Go to https://github.com/new
- Create a new repository named `yacht-exam-trainer`
- Keep it **Private** (recommended)
- **DON'T** initialize with README

---

### **STEP 3: Deploy Frontend on Vercel (5 minutes)**

1. **Go to https://vercel.com**
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Click **"New Project"**
4. **Import** your `yacht-exam-trainer` repository
5. **Configure**:
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Add Environment Variables** (click "Environment Variables"):

   ```
   VITE_SUPABASE_URL
   https://abtrsjhvjfgcxxpkszwi.supabase.co

   VITE_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw

   VITE_STRIPE_PUBLISHABLE_KEY
   pk_test_YOUR_KEY_HERE
   ```

   ⚠️ **IMPORTANT**: Replace `pk_test_YOUR_KEY_HERE` with your actual Stripe Publishable Key!

7. Click **"Deploy"**

8. **Wait 2-3 minutes** for deployment

9. 🎉 **Your site is live!** You'll get a URL like: `yacht-exam-trainer.vercel.app`

---

## 🔧 **Post-Deployment Setup (5 minutes)**

### 1. Configure Supabase Auth:

1. Go to https://supabase.com/dashboard
2. Select your project: `yacht-exam-trainer`
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`
5. Click **Save**

### 2. Create Your Admin Account:

1. Visit your live site: `https://your-app.vercel.app`
2. Click **"Login"** → **"Sign Up"** tab
3. Create an account:
   - Email: your-email@example.com
   - Password: (choose a strong password)
   - Name: Your Name
4. Click **"Sign Up"**

### 3. Make Yourself Admin:

1. Go back to **Supabase Dashboard**
2. Go to **Authentication** → **Users**
3. Click on your user
4. Copy your **User ID** (looks like: `a1b2c3d4-5678-90ab-cdef-1234567890ab`)
5. Go to **SQL Editor**
6. Paste this query (replace YOUR_USER_ID):

```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'YOUR_USER_ID';
```

7. Click **Run**
8. Refresh your site - you should now see "Admin Panel" in the footer!

---

## 📝 **Import Your Questions (5 minutes)**

1. **Prepare your CSV file** with this format:

```csv
examType,questionText,answerA,answerB,answerC,answerD,correctAnswer,difficulty,imageUrl,language
jet,What is the maximum speed in harbor?,15 knots,20 knots,25 knots,30 knots,a,1,,English
small,Which safety equipment is required?,Life jackets,Flares,Radio,Compass,a,2,,English
```

**Exam Types**: `jet`, `small`, `big`, `yacht`, `navigation`

2. **Login to your site** with your admin account

3. **Go to Admin Panel** (click footer link)

4. **Click "Import Questions"** tab

5. **Download sample CSV** if you need a template

6. **Enter your Admin Import Key** (the password you set in Step 1)

7. **Upload your CSV file** (with 600 questions)

8. **Click "Import Questions"**

9. **Check "Diagnostics"** tab to verify questions imported

---

## ✅ **You're Live! Test Everything:**

1. ✅ **Sign up a test user** on your site
2. ✅ **Try a mock exam** (free tier, 10 questions)
3. ✅ **Test payment** with Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
4. ✅ **Take a paid exam** (40 questions from your database)
5. ✅ **Check exam results**
6. ✅ **Test on mobile**

---

## 🆘 **Troubleshooting:**

### "Supabase CLI not found"
**Solution**: Install it first:
```bash
# Mac
brew install supabase/tap/supabase

# Windows
npm install -g supabase

# Linux
npm install -g supabase
```

### "git: command not found"
**Solution**: Install git:
- Mac: `brew install git`
- Windows: Download from https://git-scm.com
- Linux: `sudo apt-get install git`

### "Questions not loading"
**Solution**: 
1. Check you imported questions via Admin Panel
2. Verify your subscription is active
3. Check Diagnostics tab for question counts

### "Payment not working"
**Solution**:
1. Verify STRIPE_SECRET_KEY is set in Supabase (it should be!)
2. Check you added VITE_STRIPE_PUBLISHABLE_KEY in Vercel
3. Make sure you're using test mode keys for testing

### Edge function not deploying
**Solution**:
```bash
# Check you're logged in
supabase login

# Check project is linked
supabase link --project-ref abtrsjhvjfgcxxpkszwi

# Try deploying manually
supabase functions deploy server
```

---

## 🎉 **Success Checklist:**

- [ ] Backend deployed (edge functions)
- [ ] Code on GitHub
- [ ] Frontend deployed on Vercel
- [ ] Supabase Auth configured with site URL
- [ ] Admin account created
- [ ] Admin role granted via SQL
- [ ] Questions imported (600 total)
- [ ] Mock exam works
- [ ] Payment works (test mode)
- [ ] Paid exam works
- [ ] Mobile responsive

---

## 📞 **Need Help?**

**View logs:**
```bash
# Backend logs
supabase functions logs server --project-ref abtrsjhvjfgcxxpkszwi

# Or in Supabase Dashboard
# Edge Functions → server → Logs
```

**Common issues**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting

**Check status:**
- Supabase: https://status.supabase.com
- Vercel: https://www.vercel-status.com
- Stripe: https://status.stripe.com

---

## 🚀 **Next Steps After Launch:**

1. Configure custom domain in Vercel (optional)
2. Set up Stripe webhooks for auto-subscription updates
3. Switch to Stripe live mode when ready for real payments
4. Add Google Analytics (optional)
5. Start marketing to maritime schools!

---

**Good luck! You're about to have a live yacht exam training platform! 🛥️⚓**
