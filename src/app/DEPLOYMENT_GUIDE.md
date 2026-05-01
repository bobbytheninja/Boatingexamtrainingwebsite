# Yacht Exam Trainer - Deployment Guide

## 🚀 Complete Deployment Steps

### Phase 1: Supabase Project Setup (15-20 min)

#### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Choose organization and project name: `yacht-exam-trainer`
4. Set a strong database password (save it securely!)
5. Select region closest to your users (e.g., Europe for Bulgaria)
6. Click "Create new project" and wait 2-3 minutes

#### 1.2 Get Your Project Credentials
1. In Supabase Dashboard → **Settings** → **API**
2. Copy and save these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Project ID** (the xxxxx part)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) ⚠️ Keep this secret!

3. In Supabase Dashboard → **Settings** → **Database**
   - Copy **Connection String** (you'll need this later)

---

### Phase 2: Deploy Supabase Edge Functions (10 min)

#### 2.1 Install Supabase CLI
```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (use scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use npm (all platforms)
npm install -g supabase
```

#### 2.2 Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate.

#### 2.3 Link Your Project
```bash
# Get your project reference ID from Supabase dashboard (Settings → General)
supabase link --project-ref YOUR_PROJECT_ID
```

#### 2.4 Set Environment Secrets for Edge Functions
```bash
# Set Supabase secrets (replace with your actual values)
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
supabase secrets set SUPABASE_DB_URL=your_database_connection_string

# Set Stripe secret key (get from Stripe dashboard)
supabase secrets set STRIPE_SECRET_KEY=sk_test_... or sk_live_...

# Set admin import key (create a random secure key)
supabase secrets set ADMIN_IMPORT_KEY=your-random-secure-key-here
```

#### 2.5 Deploy Edge Functions
```bash
# Deploy all functions at once
supabase functions deploy server

# If successful, you'll see:
# Deployed Function server with version xxx
```

---

### Phase 3: Configure Stripe (10-15 min)

#### 3.1 Get Stripe API Keys
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create account or login
3. Go to **Developers** → **API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Already set in Phase 2.4

#### 3.2 Create Stripe Products
1. In Stripe Dashboard → **Products** → **Add Product**
2. Create 5 products (one for each exam type):
   
   **Product 1: Jet Ski Exam**
   - Name: `Jet Ski License Exam Access`
   - Price: €5.00/month (recurring)
   - Copy the **Price ID** (starts with `price_...`)

   **Product 2: Small Boat Exam**
   - Name: `Small Boat License Exam Access`
   - Price: €5.00/month (recurring)
   - Copy the **Price ID**

   **Product 3: Big Boat Exam**
   - Name: `Big Boat License Exam Access`
   - Price: €5.00/month (recurring)
   - Copy the **Price ID**

   **Product 4: Yacht Exam**
   - Name: `Yacht License (up to 50 tons) Exam Access`
   - Price: €5.00/month (recurring)
   - Copy the **Price ID**

   **Product 5: Navigation Device Exam**
   - Name: `Navigation Device Exam Access`
   - Price: €5.00/month (recurring)
   - Copy the **Price ID**

3. Save all 5 Price IDs - you'll need them for the frontend

#### 3.3 Configure Stripe Webhooks (Optional but Recommended)
1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d36f8f91/stripe-webhook`
4. Listen to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook signing secret** (starts with `whsec_...`)
6. Add to Supabase secrets:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

### Phase 4: Deploy Frontend (10-15 min)

#### Option A: Deploy to Vercel (Recommended)

**4.A.1 Prepare Repository**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Yacht Exam Trainer"

# Push to GitHub
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/yacht-exam-trainer.git
git branch -M main
git push -u origin main
```

**4.A.2 Deploy to Vercel**
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

6. Click "Deploy"
7. Wait 2-3 minutes for deployment
8. Your site will be live at `https://yacht-exam-trainer.vercel.app`

**4.A.3 Add Custom Domain (Optional)**
1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `yachtexamtrainer.com`)
3. Follow DNS configuration instructions
4. SSL will be automatic

---

#### Option B: Deploy to Netlify

**4.B.1 Prepare for Netlify**
1. Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Go to [https://netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Add Environment Variables (same as Vercel)
6. Click "Deploy site"

---

### Phase 5: Configure Authentication (5 min)

#### 5.1 Configure Site URL in Supabase
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your deployed URLs:
   - **Site URL**: `https://your-app.vercel.app` or your custom domain
   - **Redirect URLs**: Add the same URL

#### 5.2 Configure Email Templates (Optional)
1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize email templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

---

### Phase 6: Import Questions to Database (10-15 min)

#### 6.1 Prepare Questions CSV
Use the format from `/public/sample-questions.csv`:
```csv
examType,questionText,answerA,answerB,answerC,answerD,correctAnswer,difficulty,imageUrl
jet,"Question text here","Answer A","Answer B","Answer C","Answer D","a",2,
small,"Another question","Answer A","Answer B","Answer C","Answer D","b,c",3,
```

#### 6.2 Create First Admin User
1. Sign up on your deployed site
2. Get your user ID from Supabase Dashboard → **Authentication** → **Users**
3. Use Supabase SQL Editor to make yourself admin:
```sql
-- Get your user ID from the auth.users table first, then run:
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'YOUR_USER_ID_HERE';
```

#### 6.3 Import Questions via Admin Panel
1. Login to your deployed site as admin
2. Navigate to `/admin` (you should see "Admin Panel" in footer)
3. Go to **Import Questions** tab
4. Upload your CSV file with 600 questions
5. Click "Import Questions"
6. Verify in **Diagnostics** tab that questions are imported

---

### Phase 7: Testing & Launch (15-20 min)

#### 7.1 Test Core Functionality
- [ ] Sign up new user
- [ ] Login / Logout
- [ ] Try mock exam (free tier)
- [ ] Purchase subscription via Stripe
- [ ] Take paid exam with database questions
- [ ] Check exam results saved
- [ ] Test mobile responsiveness
- [ ] Test dark mode
- [ ] Test all 4 languages
- [ ] Test admin panel (user management, question import)

#### 7.2 Switch to Stripe Live Mode (When Ready)
1. In Stripe Dashboard, activate your account
2. Get live API keys (Developers → API Keys)
3. Create live products (same as test mode)
4. Update environment variables:
   ```bash
   # Update Vercel/Netlify env vars
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   
   # Update Supabase secrets
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```
5. Redeploy

#### 7.3 SEO & Performance
1. Add `robots.txt`:
```txt
User-agent: *
Allow: /
Sitemap: https://yoursite.com/sitemap.xml
```

2. Add meta tags in `index.html`:
```html
<meta name="description" content="Professional yacht and boat license exam training platform. Practice for jet ski, small boat, big boat, yacht (up to 50 tons), and navigation device exams.">
<meta property="og:title" content="Yacht Exam Trainer - Maritime License Practice">
<meta property="og:description" content="Professional yacht and boat license exam training">
<meta property="og:image" content="https://yoursite.com/og-image.png">
```

---

## 📋 Post-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Edge functions deployed
- [ ] Stripe products created (5 exam types)
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Custom domain configured (optional)
- [ ] First admin user created
- [ ] Questions imported (600 total across 5 exam types)
- [ ] Email templates configured
- [ ] All environment variables set
- [ ] Stripe webhooks configured
- [ ] Tested on mobile and desktop
- [ ] Switched to Stripe live mode (when ready)
- [ ] Analytics added (Google Analytics, Plausible, etc.)
- [ ] Privacy policy and terms of service added
- [ ] Contact email configured

---

## 🆘 Troubleshooting

### Edge Function Errors
```bash
# View function logs
supabase functions logs server --project-ref YOUR_PROJECT_ID

# Test function locally
supabase functions serve server
```

### Database Issues
```bash
# Check if KV store is working
# Use Supabase SQL Editor:
SELECT * FROM kv_store_d36f8f91 LIMIT 10;
```

### Stripe Payment Issues
- Verify webhook is receiving events in Stripe Dashboard
- Check that Price IDs match your products
- Ensure STRIPE_SECRET_KEY is set correctly

### Questions Not Loading
- Check Admin Panel → Diagnostics for question counts
- Verify user has active subscription
- Check browser console for API errors
- Verify `ADMIN_IMPORT_KEY` was used during import

---

## 💰 Cost Estimation

**Monthly Costs (approximate):**
- **Supabase Free Tier**: €0 (up to 500MB database, 2GB bandwidth)
- **Supabase Pro** (if needed): €25/month
- **Vercel/Netlify**: €0 (free tier usually sufficient)
- **Stripe**: 1.4% + €0.25 per transaction (EU cards)
- **Custom Domain**: €10-15/year

**Total**: ~€0-25/month to start, scales with usage

---

## 🎯 Next Steps After Launch

1. **Marketing**: Set up Google Ads, Facebook Ads for maritime schools
2. **Analytics**: Add Google Analytics or Plausible
3. **Feedback**: Add user feedback form
4. **Content**: Add blog with maritime exam tips
5. **Features**: Add progress tracking, study notes, flashcards
6. **Languages**: Add more languages based on demand
7. **Partnerships**: Reach out to maritime schools in Bulgaria
8. **Mobile App**: Consider React Native app for app stores

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com

Good luck with your launch! 🚢⚓
