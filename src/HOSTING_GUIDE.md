# 🚀 Yacht Exam Trainer - Hosting Guide

This is the **one and only guide** you need to host your yacht exam trainer on the web.

---

## 📋 What You Need

1. ✅ **GitHub account** (free) - To store your code
2. ✅ **Vercel account** (free) - To host the frontend
3. ✅ **Your project already working locally** - Backend deployed to Supabase

**Total time:** 15-20 minutes  
**Total cost:** €0 (free tier)

---

## Step 1: Push Your Code to GitHub (10 min)

### Option A: Use the Script (Easiest)

```bash
./setup-github.sh
```

Follow the prompts and you're done!

### Option B: Manual Setup

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name: `yacht-exam-trainer`
   - Make it **Private** (recommended)
   - Don't add README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Yacht Exam Trainer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/yacht-exam-trainer.git
   git push -u origin main
   ```

✅ **Your code is now on GitHub!**

---

## Step 2: Deploy to Vercel (5 min)

### 2.1 Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 2.2 Import Your Project

1. Click **"Add New" → "Project"**
2. Find `yacht-exam-trainer` in your repos
3. Click **"Import"**

### 2.3 Configure Build Settings

**Framework Preset:** Vite  
**Root Directory:** `./`  
**Build Command:** `npm run build` (auto-filled)  
**Output Directory:** `dist` (auto-filled)

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these **3 variables**:

| Name | Value | Where to Find It |
|------|-------|------------------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (long string) | Supabase Dashboard → Settings → API → anon/public key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Stripe Dashboard → Developers → API Keys |

**IMPORTANT:** 
- Don't use the `SUPABASE_SERVICE_ROLE_KEY` here (that stays in Supabase only!)
- Use Stripe **test** keys for now (they start with `pk_test_` and `sk_test_`)

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes ⏳
3. 🎉 **Your site is live!**

You'll get a URL like: `https://yacht-exam-trainer.vercel.app`

---

## Step 3: Configure Supabase Auth (2 min)

Your deployed site needs permission to use Supabase auth.

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication → URL Configuration**
4. Add these URLs:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`
5. Click **Save**

✅ **Authentication is now configured!**

---

## Step 4: Test Your Live Site (5 min)

### 4.1 Create Your First Account

1. Visit your live site: `https://your-app.vercel.app`
2. Click **"Login" → "Sign Up"** tab
3. Create an account with your email

### 4.2 Make Yourself Admin

1. Go to Supabase Dashboard → **Authentication → Users**
2. Find your user and copy the **ID** (looks like: `550e8400-e29b-41d4-a716-446655440000`)
3. Go to **SQL Editor** → Click **"New Query"**
4. Paste this (replace with your ID):
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE id = 'YOUR_USER_ID_HERE';
   ```
5. Click **Run**

### 4.3 Import Questions

1. On your live site, you should now see **"Admin"** in the footer
2. Click **"Admin Panel"**
3. Go to **"Import Questions"** tab
4. Upload your Excel/CSV file
5. Enter admin key: `change-this-key`
6. Click **"Import Questions"**

### 4.4 Test Everything

- ✅ Try a **Mock Exam** (free, first 10 questions)
- ✅ Check **Diagnostics** tab in admin panel
- ✅ Try different languages (top-right corner)
- ✅ Test dark mode toggle
- ✅ Test on mobile (responsive design)

---

## Step 5: Grant Yourself a Test License (Optional)

Want to test paid exams without paying?

1. **Admin Panel → User Management**
2. Find your email in the list
3. Click **"Grant License"** for any exam type
4. Set expiry date (e.g., 30 days from now)
5. Click **"Grant"**

Now you can take full 40-question paid exams!

---

## 🎯 What Happens Next?

### When You Make Changes:

**Frontend changes** (React components, UI, etc.):
1. Make changes locally
2. Test locally
3. Push to GitHub: `git push`
4. Vercel automatically redeploys ✅ (takes 1-2 minutes)
5. Refresh your browser!

**Backend changes** (Supabase functions):
1. Make changes locally
2. Run: `./deploy-backend.sh`
3. That's it! ✅

### You CAN still work with me here:
- Yes! Even after hosting
- We can make changes to components
- We can add new features
- We can fix bugs
- You just need to `git push` after I make changes

---

## 🔧 Add a Custom Domain (Optional)

Want `yachtexamtrainer.com` instead of `.vercel.app`?

1. **Buy a domain** (e.g., from Namecheap, GoDaddy, Google Domains)
2. In Vercel Dashboard → **Settings → Domains**
3. Click **"Add"**
4. Enter your domain
5. Follow DNS configuration instructions
6. Wait 5-10 minutes for DNS to propagate
7. ✅ **SSL certificate automatically added!**

---

## 🚨 Common Issues & Solutions

### "Can't sign up - Network error"
**Solution:** Check that you added your Vercel URL to Supabase Auth → URL Configuration

### "Questions not loading"
**Solution:** 
- Check Admin Panel → Diagnostics
- Verify you imported questions
- Check browser console for errors

### "Payment page crashes"
**Solution:**
- Make sure you added `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
- Use `pk_test_...` key for testing
- Check Stripe Dashboard is accessible

### "I made changes but site didn't update"
**Solution:**
- Did you push to GitHub? `git push`
- Vercel shows deployment status at: https://vercel.com/dashboard
- Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### "Admin panel showing 404"
**Solution:**
- Did you make yourself admin in Supabase?
- Run the SQL query from Step 4.2 above
- Hard refresh your browser

---

## 💰 Costs

### Free Tier (Perfect for Starting):
- **Vercel:** €0/month
  - 100 GB bandwidth
  - Unlimited deployments
  - Custom domain support
  - SSL included
- **Supabase:** €0/month
  - 500 MB database
  - 2 GB bandwidth
  - 50,000 monthly active users
- **Stripe:** €0/month
  - Only pay transaction fees: 1.4% + €0.25 per transaction
- **GitHub:** €0/month (private repos included)

**Total:** €0/month to start! 🎉

### When You Grow:
If you get lots of users and hit limits:
- **Supabase Pro:** €25/month (more database space & bandwidth)
- **Vercel:** Still free for most use cases
- **Total:** ~€25/month for thousands of users

---

## 📈 Going Live (Stripe Production Mode)

When ready to accept real payments:

1. **Activate Stripe account:**
   - Stripe Dashboard → Complete account setup
   - Add bank details for payouts
   - Verify business information

2. **Get production keys:**
   - Stripe Dashboard → Developers → API Keys
   - Toggle to **"Production"** mode
   - Copy new keys (`pk_live_...` and `sk_live_...`)

3. **Update environment variables:**
   - **Vercel:** Settings → Environment Variables
     - Update `VITE_STRIPE_PUBLISHABLE_KEY` to `pk_live_...`
   - **Supabase:** Run in terminal:
     ```bash
     supabase secrets set STRIPE_SECRET_KEY=sk_live_...
     ```

4. **Redeploy everything:**
   ```bash
   ./deploy-backend.sh  # Update backend
   git push             # Update frontend
   ```

5. **Test with a real card** (use your own card, then refund yourself)

✅ **You're now accepting real payments!**

---

## ✅ Final Checklist

Before you share your site with the world:

- [ ] Site deployed on Vercel
- [ ] Custom domain configured (optional)
- [ ] All 5 exam types have questions imported
- [ ] Tested mock exam (free tier)
- [ ] Tested paid exam with test license
- [ ] Tested signup/login flow
- [ ] Tested on mobile device
- [ ] Tested dark mode
- [ ] Admin panel accessible
- [ ] Stripe test payment works
- [ ] All 4 languages work
- [ ] Terms and privacy policy reviewed
- [ ] Contact information updated

---

## 🎓 Resources

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

## 🎉 Congratulations!

Your yacht exam training platform is now **live on the internet**!

**Share your site:**
- Send the URL to friends for feedback
- Share on social media
- Reach out to maritime schools
- Add to your business cards

**Next steps:**
- Add Google Analytics to track visitors
- Create Facebook/Instagram ads
- Write blog posts about maritime exams
- Partner with yacht clubs and schools
- Consider a mobile app (React Native)

Good luck! 🚢⚓

---

**Questions?** Check the troubleshooting section above or review the full deployment guide at `/DEPLOYMENT_GUIDE.md`
