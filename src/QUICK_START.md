# 🚀 Quick Start - Get Your Site Live in 30 Minutes!

This is the **fast track** version. For complete details, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites
- GitHub account
- Supabase account (free tier is fine)
- Stripe account (test mode is fine)
- Vercel or Netlify account (free tier)

---

## Step 1: Supabase Setup (5 min)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `yacht-exam-trainer`
3. Copy these 3 values from **Settings → API**:
   - ✅ Project URL
   - ✅ Project ID  
   - ✅ Anon/Public Key
   - ✅ Service Role Key (keep secret!)

---

## Step 2: Install Supabase CLI & Deploy Functions (5 min)

```bash
# Install CLI (choose your platform)
npm install -g supabase   # OR
brew install supabase/tap/supabase   # macOS
scoop install supabase    # Windows

# Login & link project
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Set secrets
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_DB_URL=your_database_url
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set ADMIN_IMPORT_KEY=choose-a-random-secure-password

# Deploy functions
supabase functions deploy server
```

---

## Step 3: Stripe Setup (5 min)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get **Publishable Key** from **Developers → API Keys**
3. Create 5 monthly products at €5 each:
   - Jet Ski Exam Access
   - Small Boat Exam Access  
   - Big Boat Exam Access
   - Yacht Exam Access
   - Navigation Device Exam Access
4. Copy each **Price ID** (you'll need these later for PaymentPage.tsx)

---

## Step 4: Deploy to Vercel (5 min)

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/yacht-exam-trainer.git
git push -u origin main
```

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. **Framework**: Vite
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Click **Deploy**

🎉 **Your site is now live!** (e.g., `yacht-exam-trainer.vercel.app`)

---

## Step 5: Configure Auth & Create Admin (5 min)

1. In Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://yacht-exam-trainer.vercel.app`
   - Redirect URLs: Same URL

2. Sign up on your live site

3. Make yourself admin (in Supabase SQL Editor):
   ```sql
   -- First, get your user ID from Authentication → Users
   -- Then run this:
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE id = 'YOUR_USER_ID_HERE';
   ```

---

## Step 6: Import Questions (5 min)

1. Login to your site as admin
2. Footer should show "Admin Panel" button
3. Go to `/admin` → **Import Questions** tab
4. Prepare CSV file (see `/public/sample-questions.csv` for format)
5. Upload and import 600 questions
6. Check **Diagnostics** tab to verify counts

---

## ✅ You're Live!

Test everything:
- ✅ Sign up / Login works
- ✅ Mock exams work (free tier)
- ✅ Payment flow works (use Stripe test card: `4242 4242 4242 4242`)
- ✅ Paid exams load 40 random questions from database
- ✅ Admin panel accessible
- ✅ Mobile responsive
- ✅ Dark mode works

---

## 🔧 Update Stripe Price IDs in Code

You need to update the Stripe Price IDs in the code with your actual Price IDs from Stripe:

**File**: `/supabase/functions/server/index.tsx` (around line 430)

```typescript
const priceIds: Record<string, string> = {
  jet: 'price_YOUR_JET_SKI_PRICE_ID',
  small: 'price_YOUR_SMALL_BOAT_PRICE_ID',
  big: 'price_YOUR_BIG_BOAT_PRICE_ID',
  yacht: 'price_YOUR_YACHT_PRICE_ID',
  navigation: 'price_YOUR_NAVIGATION_PRICE_ID',
};
```

After updating, redeploy functions:
```bash
supabase functions deploy server
```

---

## 🎯 Next Steps

- [ ] Switch to Stripe **Live Mode** when ready for real payments
- [ ] Add custom domain in Vercel settings
- [ ] Set up Stripe webhooks for auto-subscription updates
- [ ] Add Google Analytics
- [ ] Customize email templates in Supabase
- [ ] Add Privacy Policy & Terms of Service pages
- [ ] Start marketing to maritime schools!

---

## 🆘 Need Help?

**Common Issues:**

1. **"No questions available"** → Check Admin Panel → Diagnostics for question counts
2. **Edge function errors** → Check logs: `supabase functions logs server`
3. **Payment not working** → Verify STRIPE_SECRET_KEY is set and Price IDs are correct
4. **Can't see admin panel** → Verify your user has `role: admin` in user_metadata

**Logs:**
```bash
# View edge function logs
supabase functions logs server --project-ref YOUR_PROJECT_ID

# Test locally
supabase start
supabase functions serve server
```

---

## 📱 Test Card Numbers (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`
- Use any future expiry date, any CVC

---

Good luck with your launch! 🚢⚓
