# 🚀 FINAL DEPLOYMENT - Let's Go Live!

Your configuration is complete! Here's exactly what to do next.

---

## ✅ **What's Configured:**

- ✅ Supabase backend: `abtrsjhvjfgcxxpkszwi`
- ✅ Stripe key: Added
- ✅ Code pushed to GitHub: ✓
- ✅ Environment files: Created

---

## 🎯 **STEP 1: Deploy Backend (5 minutes)**

Choose your operating system:

### **Mac/Linux:**

```bash
# Make script executable
chmod +x deploy-backend.sh

# Run deployment
./deploy-backend.sh
```

### **Windows:**

Double-click `deploy-backend.bat` or run:
```bash
deploy-backend.bat
```

**When prompted for "Admin Import Key":**
- Choose a secure password (example: `YachtAdmin2024!`)
- This is used to import questions via admin panel
- **Write it down!** You'll need it later

**Example:**
```
Enter your admin import key: YachtAdmin2024!
```

---

## 🎯 **STEP 2: Deploy Frontend to Vercel (10 minutes)**

### **A. Go to Vercel:**
1. Visit: https://vercel.com
2. Click **"Sign Up"** (or login if you have account)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### **B. Import Your Repository:**
1. Click **"Add New..."** → **"Project"**
2. Find your `yacht-exam-trainer` repository
3. Click **"Import"**

### **C. Configure Project:**

**Framework Preset:** Vite (should auto-detect)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### **D. Add Environment Variables:**

Click **"Environment Variables"** and add these **3 variables**:

**Variable 1:**
```
Name:  VITE_SUPABASE_URL
Value: https://abtrsjhvjfgcxxpkszwi.supabase.co
```

**Variable 2:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw
```

**Variable 3:**
```
Name:  VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51SP7XPQyfKnmTYnIk5mOWeTqsekl04C6gydyJLZRMHW8nPHdcImcybnUiIQjz92YFurcOjA0ul9BUAyAoxtECp6h00nsPAZvho
```

### **E. Deploy:**
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. 🎉 **You're live!** Copy your URL (e.g., `yacht-exam-trainer.vercel.app`)

---

## 🎯 **STEP 3: Configure Supabase Auth (3 minutes)**

### **Add Your Site URL to Supabase:**

1. Go to: https://supabase.com/dashboard
2. Select your project: `yacht-exam-trainer`
3. Go to **Authentication** → **URL Configuration**
4. Add these URLs (replace `your-app` with your actual Vercel URL):

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/**
http://localhost:5173/**
```

5. Click **"Save"**

---

## 🎯 **STEP 4: Create Your Admin Account (2 minutes)**

### **A. Sign Up on Your Site:**
1. Go to your live site: `https://your-app.vercel.app`
2. Click **"Login"** → **"Sign Up"** tab
3. Enter:
   - Email: your-email@example.com
   - Password: (choose a strong password)
   - Name: Your Name
4. Click **"Sign Up"**

### **B. Make Yourself Admin:**

1. Go back to **Supabase Dashboard**
2. Go to **Authentication** → **Users**
3. Click on your user (the one you just created)
4. **Copy your User ID** (looks like: `a1b2c3d4-5678-90ab-cdef-1234567890ab`)
5. Go to **SQL Editor** in Supabase
6. Click **"New query"**
7. Paste this query (**replace `YOUR_USER_ID`**):

```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'YOUR_USER_ID';
```

8. Click **"Run"**
9. Refresh your website - you should now see **"Admin Panel"** in the footer!

---

## 🎯 **STEP 5: Import Your 600 Questions (5 minutes)**

### **A. Prepare Your CSV File:**

Your CSV must have these columns:
```csv
examType,questionText,answerA,answerB,answerC,answerD,correctAnswer,difficulty,imageUrl,language
```

**Example row:**
```csv
jet,What is the maximum speed in harbor?,15 knots,20 knots,25 knots,30 knots,a,1,,English
```

**Exam Types:** `jet`, `small`, `big`, `yacht`, `navigation`
**Correct Answer:** `a`, `b`, `c`, `d`, or `a,b,c` (for multiple correct)
**Difficulty:** `1`, `2`, or `3`
**Language:** `English`, `Bulgarian`, `Spanish`, `Greek`

### **B. Import via Admin Panel:**

1. Login to your site with your admin account
2. Click **"Admin Panel"** in the footer
3. Click **"Import Questions"** tab
4. **Download sample CSV** if you need a template
5. Enter your **Admin Import Key** (the password you chose in Step 1)
6. Click **"Choose File"** and select your CSV
7. Click **"Import Questions"**
8. Wait for confirmation (can take 30-60 seconds for 600 questions)
9. Check **"Diagnostics"** tab to verify counts

---

## ✅ **STEP 6: Test Everything (10 minutes)**

### **Test Checklist:**

- [ ] **Sign up a new test user**
- [ ] **Try a mock exam** (10 questions, free)
- [ ] **Check study mode** (see correct answers)
- [ ] **Test payment** with Stripe test card:
  - Card: `4242 4242 4242 4242`
  - Expiry: `12/34`
  - CVC: `123`
  - ZIP: `12345`
- [ ] **Take a paid exam** (40 questions)
- [ ] **Submit exam and see results**
- [ ] **Check account page** (see active subscriptions)
- [ ] **Test on mobile phone**
- [ ] **Try dark mode toggle**
- [ ] **Test language switcher**

### **Admin Panel Tests:**

- [ ] **View all users** in User Management
- [ ] **Grant a license** to a user manually
- [ ] **Revoke a license**
- [ ] **Check diagnostics** (question counts, subscriptions)
- [ ] **View app info** (versions, config)

---

## 🎉 **YOU'RE LIVE!**

Your yacht exam training platform is now online and ready for users!

### **Your URLs:**
- **Website:** `https://your-app.vercel.app`
- **Admin Panel:** `https://your-app.vercel.app` (click Admin Panel in footer)
- **API:** `https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/`

### **Your Credentials:**
- **Admin Email:** (your signup email)
- **Admin Password:** (your signup password)
- **Admin Import Key:** (password you chose in Step 1)

---

## 🔧 **Optional: Set Up Stripe Webhooks (Recommended)**

Webhooks automatically update subscriptions when payments succeed/fail.

### **Setup:**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:**
   ```
   https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/stripe/webhook
   ```
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go to **Supabase Dashboard** → **Edge Functions** → **server** → **Secrets**
8. Add secret:
   ```
   Name:  STRIPE_WEBHOOK_SECRET
   Value: whsec_...your secret...
   ```

**Now subscriptions will auto-update!**

---

## 🚀 **Next Steps:**

### **Before Going Public:**
- [ ] Test all functionality thoroughly
- [ ] Import all 600 questions
- [ ] Create a custom domain (optional): Configure in Vercel settings
- [ ] Switch to Stripe **Live Mode** when ready for real payments
- [ ] Set up email templates in Supabase (optional)
- [ ] Configure password reset flow
- [ ] Add your company information to footer

### **Marketing:**
- [ ] Create social media accounts
- [ ] Contact maritime schools in Bulgaria
- [ ] Create promotional materials
- [ ] Set up Google Analytics (optional)
- [ ] Consider SEO optimization

---

## 🆘 **Troubleshooting:**

### **Backend deployment failed:**
```bash
# Check logs
supabase functions logs server --project-ref abtrsjhvjfgcxxpkszwi

# Re-deploy
supabase link --project-ref abtrsjhvjfgcxxpkszwi
supabase functions deploy server
```

### **"Questions not loading":**
1. Check you imported questions via Admin Panel
2. Verify admin import key was correct
3. Check Diagnostics tab for question counts
4. Look at browser console for errors

### **"Payment not working":**
1. Verify Stripe publishable key in Vercel env vars
2. Check Stripe secret key in Supabase secrets
3. Make sure you're in test mode
4. Check browser console for errors

### **"Not authorized" errors:**
1. Make sure you ran the SQL to make yourself admin
2. Verify you're logged in
3. Check raw_user_meta_data has role: "admin"

### **Site not loading:**
1. Check Vercel deployment logs
2. Verify all 3 environment variables are set
3. Try rebuilding the project in Vercel

---

## 📊 **Monitor Your Site:**

### **Supabase Dashboard:**
- User signups: **Authentication** → **Users**
- Database data: **Table Editor** → **kv_store_d36f8f91**
- API logs: **Edge Functions** → **server** → **Logs**
- Usage: **Settings** → **Usage**

### **Vercel Dashboard:**
- Deployments: See all deployments and logs
- Analytics: Page views, visitors (free tier)
- Functions: Edge function performance

### **Stripe Dashboard:**
- Payments: See all test/live payments
- Subscriptions: Active subscriptions
- Customers: User payment info

---

## 💰 **When to Switch to Live Mode:**

Currently you're in **Test Mode** (no real money). Switch to **Live Mode** when:

1. ✅ You've tested everything thoroughly
2. ✅ All 600 questions are imported
3. ✅ You've completed a few test exams
4. ✅ You're ready to accept real customers
5. ✅ You've activated your Stripe account (identity verification)

### **To Switch:**

1. Activate your Stripe account: https://dashboard.stripe.com/account/onboarding
2. Get your **Live** API keys from Stripe
3. Update Vercel environment variables:
   - Change `VITE_STRIPE_PUBLISHABLE_KEY` to your `pk_live_...` key
4. Update Supabase secrets:
   - Change `STRIPE_SECRET_KEY` to your `sk_live_...` key
5. Redeploy or restart your services

**⚠️ Don't forget to update webhook endpoint with live signing secret!**

---

## 🎓 **Support Resources:**

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Your Documentation**: See all the .md files in your project

---

## 🎉 **Congratulations!**

You now have a fully functional yacht exam training platform! 

**What you've accomplished:**
- ✅ Secure user authentication
- ✅ Payment processing
- ✅ Question database (600 questions)
- ✅ Admin panel
- ✅ Responsive design
- ✅ Dark mode
- ✅ Multi-language support
- ✅ Production-ready deployment

**Time to get users and start making money!** 🛥️⚓💰

---

**Good luck with your yacht exam training business!** 🚀
