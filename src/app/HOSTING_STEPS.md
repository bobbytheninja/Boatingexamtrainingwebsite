# 🚀 Quick Hosting Guide - Get Your Yacht Exam Site Live

## ✅ What You Already Have
- ✅ Backend deployed on Supabase (Edge Functions)
- ✅ Stripe Secret Key configured
- ✅ Frontend code ready
- ✅ Database structure ready

## 📝 What You Need To Do

### Step 1: Set Up Stripe Webhook (5 minutes)

1. **Get Your Webhook Endpoint URL**
   - Your webhook URL is: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d36f8f91/stripe-webhook`
   - Replace `YOUR_PROJECT_ID` with your actual Supabase project ID

2. **Configure in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Paste your webhook URL
   - Select events to listen to:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - Click "Add endpoint"
   - **Copy the "Signing secret"** (starts with `whsec_...`)

3. **Add Webhook Secret to Supabase**
   ```bash
   # In your terminal, run:
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

---

### Step 2: Deploy Frontend to Vercel (10 minutes)

#### A. Push Code to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it: `yacht-exam-trainer`
   - Make it private or public (your choice)
   - Don't initialize with README (you already have code)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   # If you haven't initialized git yet:
   git init
   git add .
   git commit -m "Initial commit - Yacht Exam Trainer"
   
   # Add GitHub as remote (replace YOUR_USERNAME):
   git remote add origin https://github.com/YOUR_USERNAME/yacht-exam-trainer.git
   git branch -M main
   git push -u origin main
   ```

#### B. Deploy to Vercel

1. **Sign up / Login to Vercel:**
   - Go to https://vercel.com
   - Click "Sign Up" and use your GitHub account

2. **Import Your Project:**
   - Click "Add New..." → "Project"
   - Select your `yacht-exam-trainer` repository
   - Click "Import"

3. **Configure Build Settings:**
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (should auto-fill)
   - Output Directory: `dist` (should auto-fill)

4. **Add Environment Variables:**
   Click "Environment Variables" and add these three:
   
   ```
   Name: VITE_SUPABASE_URL
   Value: https://YOUR_PROJECT_ID.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: your_supabase_anon_key
   
   Name: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_test_your_stripe_publishable_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://yacht-exam-trainer.vercel.app`

---

### Step 3: Update Supabase Auth Settings (2 minutes)

1. **Go to Supabase Dashboard:**
   - Navigate to **Authentication** → **URL Configuration**

2. **Add Your Vercel URL:**
   - **Site URL**: `https://your-app-name.vercel.app`
   - **Redirect URLs**: Add the same URL

3. **Click Save**

---

### Step 4: Create Your Admin Account (5 minutes)

1. **Sign up on your live site:**
   - Go to your Vercel URL
   - Click "Sign Up"
   - Create an account

2. **Make yourself an admin:**
   - Go to Supabase Dashboard → **SQL Editor**
   - Click "New Query"
   - Find your user ID first:
   ```sql
   SELECT id, email FROM auth.users;
   ```
   - Copy your user ID, then run:
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE id = 'YOUR_USER_ID_HERE';
   ```

3. **Refresh your site** - You should now see "Admin Panel" in the navigation

---

### Step 5: Import Your Questions (10 minutes)

1. **Prepare your CSV file** with format:
   ```csv
   examType,questionText,answerA,answerB,answerC,answerD,correctAnswer,difficulty,imageUrl
   jet,"Question text",... (etc)
   ```

2. **Go to Admin Panel:**
   - Navigate to `/admin` on your live site
   - Click "Import Questions" tab

3. **Upload CSV:**
   - Select your CSV file
   - Click "Import Questions"
   - Wait for confirmation

4. **Verify:**
   - Go to "Diagnostics" tab
   - Check that all 600 questions are imported

---

### Step 6: Test Everything (10 minutes)

Go through this checklist:

- [ ] Sign up works
- [ ] Login/logout works
- [ ] Mock exams work (free tier)
- [ ] Can see payment page
- [ ] Stripe checkout opens (test with card: 4242 4242 4242 4242)
- [ ] After payment, subscription appears in account
- [ ] Can take paid exam
- [ ] Dark mode works
- [ ] Language switching works
- [ ] Mobile responsive
- [ ] Admin panel accessible

---

## 🎉 You're Live!

Your site is now running at: `https://your-app.vercel.app`

### Optional: Add Custom Domain

1. **Buy a domain** (e.g., from Namecheap, GoDaddy)
2. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions
3. **Update Supabase Auth URLs** with your custom domain

---

## 🔄 How to Update Your Site

Whenever you want to make changes:

```bash
# Make your changes to the code
git add .
git commit -m "Description of changes"
git push

# Vercel will automatically rebuild and deploy!
```

---

## 💡 Important URLs to Save

- **Live Site**: `https://your-app.vercel.app`
- **Supabase Dashboard**: `https://app.supabase.com/project/YOUR_PROJECT_ID`
- **Stripe Dashboard**: `https://dashboard.stripe.com`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/yacht-exam-trainer`

---

## 🆘 Need Help?

**Vercel Deployment Issues:**
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly

**Stripe Not Working:**
- Check webhook is receiving events in Stripe Dashboard → Webhooks
- Verify STRIPE_WEBHOOK_SECRET is set in Supabase

**Questions Not Loading:**
- Check Admin Panel → Diagnostics
- Verify questions imported successfully
- Check browser console for errors

---

## 💰 When Ready to Go Live (Accept Real Payments)

1. Activate your Stripe account
2. Get live API keys from Stripe (pk_live_... and sk_live_...)
3. Update environment variables in Vercel and Supabase
4. Create webhook for live mode in Stripe
5. Redeploy

**That's it! You're ready to start accepting students! 🚢⚓**
