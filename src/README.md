# 🚤 Yacht Exam Training Platform

A comprehensive web application for yacht exam training with multiple exam categories, payment integration, and question management.

## 📚 **Documentation Guide**

Choose the guide that matches what you want to do:

### 🏠 Working Locally (Development)
- **[README.md](./README.md)** ← You are here! Local development guide

### 🌐 Host on the Web (Production)
- **[HOSTING_GUIDE.md](./HOSTING_GUIDE.md)** ⭐ **START HERE** - One guide to rule them all!
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed technical guide (2+ hours)
- **[QUICK_START.md](./QUICK_START.md)** - Speed run version (30 min)

### ✅ Before You Launch
- **[PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md)** - Final checklist before going live

---

## 🚨 First Time Here?

**If you want to host this on the web RIGHT NOW:**
👉 **[Read HOSTING_GUIDE.md](./HOSTING_GUIDE.md)** 👈

**If you're just testing locally:**
Keep reading this file!

---

## 🚨 IMPORTANT: Fixing "Invalid Login Credentials" Error

**If you're seeing this error, it's because no user accounts exist yet!**

### Quick Solution (Easiest):

1. **Click the "Admin" link** in the footer (bottom right of any page)
2. Go to the **"Test Auth"** tab
3. Click the big green **"Create & Login with Demo Account"** button
4. ✅ Done! You're now logged in and can test everything

### Alternative Solution:

1. Go to the **Login** page (top right navigation)
2. Click the **"Sign Up"** tab (NOT "Sign In")
3. Enter your details:
   - Email: `test@example.com` (or your own)
   - Password: `testpass123` (or your own)
   - Name: `Test User` (or your name)
4. Click **"Sign Up"**
5. ✅ You'll be automatically logged in!

### Why This Happens:

- Supabase authentication starts with zero users
- You cannot log in until you create an account first
- The signup process creates the account AND logs you in automatically
- After that, you can use the same credentials to log in anytime

---

## 📋 Quick Start Guide

### 1️⃣ Create Your First Account

Follow the steps above to create a demo account or your own account.

### 2️⃣ Import Your 600 Questions

1. Go to **Admin** page (footer link)
2. Click **"Import Questions"** tab
3. Prepare your CSV file with this format:

```csv
examType,questionText,answerA,answerB,answerC,answerD,correctAnswer,difficulty,imageUrl,language
jet,What is the maximum speed in harbor?,15 knots,20 knots,25 knots,30 knots,a,1,,English
yacht,Which safety equipment is mandatory?,Life jackets,Flares,Fire extinguisher,Anchor,a,2,,English
```

4. Download the **sample CSV template** from the Admin page
5. Enter admin key: `change-this-key` (default)
6. Upload your CSV file
7. Click **Import Questions**

**Exam Types:**
- `jet` - Jet Ski Exam
- `small` - Small Boat Exam  
- `big` - Big Boat Exam
- `yacht` - Yacht Exam (up to 50 tons)
- `navigation` - Navigation Device Exam

### 3️⃣ Test the Payment Flow

1. Make sure you're logged in
2. Go to **Account** page (top right)
3. Click **"Unlock Paid Exams"**
4. Select exam category (€5/month)
5. Click **"Proceed to Checkout"**
6. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25` (any future date)
   - CVC: `123` (any 3 digits)
7. Complete checkout
8. Return to see active subscription
9. Start taking exams with your imported questions!

---

## 🎯 Features

✅ **5 Exam Categories:**
- Jet Ski
- Small Boat
- Big Boat
- Yacht (up to 50 tons)
- Navigation Device

✅ **Exam System:**
- 40 questions per exam (paid) or 10 (mock)
- Difficulty-based points (1, 2, or 3 points)
- Must lose maximum 6 points to pass
- 60-minute timer for exam mode
- Study mode with instant feedback
- Question navigator
- Progress tracking

✅ **Authentication:**
- Sign up / Sign in
- Email verification (auto-confirmed)
- Password reset functionality
- Session management

✅ **Payment Integration:**
- Stripe Checkout
- €5/month per exam category
- 30-day subscriptions
- Automatic activation via webhooks
- Payment success confirmation

✅ **Question Management:**
- CSV bulk import
- 600+ question capacity
- Multiple correct answers support
- Image support for questions
- Multi-language support (English/Bulgarian)

✅ **User Experience:**
- Responsive design
- Dark mode support
- Keyboard navigation
- Loading states
- Error handling
- Toast notifications

---

## 🔧 Configuration

### Environment Variables (Already Set ✅)

The following secrets are already configured:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

### Stripe Webhook Setup (Required for Payments)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter URL: `https://[your-project-id].supabase.co/functions/v1/make-server-d36f8f91/stripe-webhook`
4. Select event: `checkout.session.completed`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add to Supabase:
   - Go to Supabase Dashboard
   - Edge Functions → Settings → Secrets
   - Add: `STRIPE_WEBHOOK_SECRET` = [your secret]

### Admin Import Key (Optional)

Default: `change-this-key`

For production, change this:
1. Supabase Dashboard → Edge Functions → Secrets
2. Add: `ADMIN_IMPORT_KEY` = [your secure key]

---

## 📖 How to Use

### For Free Users (Mock Exams):
1. Select exam type from home page
2. Choose **"Mock Exam"** tier
3. Take practice exam with 10 sample questions

### For Paid Users (Real Exams):
1. **Sign up** if you haven't already
2. **Purchase** exam category subscription
3. **Import** your questions (Admin panel)
4. **Take exams** with full 40 questions from your database

### Study Mode vs Exam Mode:
- **Study Mode**: Instant feedback after each question, no timer
- **Exam Mode**: 60-minute timer, results at the end, simulates real exam

---

## 🐛 Troubleshooting

### "Invalid login credentials"
→ **Solution**: You need to sign up first! See the top of this README.

### Questions not loading
→ **Solution**: 
  1. Make sure you imported questions via Admin panel
  2. Check `examType` in CSV matches exactly: `jet`, `small`, `big`, `yacht`, `navigation`
  3. Verify you have an active subscription for that exam type

### Payment not activating subscription
→ **Solution**:
  1. Check Stripe webhook is configured
  2. Verify `STRIPE_WEBHOOK_SECRET` is set
  3. Check Supabase Edge Function logs

### CSV import fails
→ **Solution**:
  1. Verify CSV format matches the template
  2. Check admin key is correct
  3. Ensure CSV is UTF-8 encoded
  4. Wrap text with commas in quotes

---

## 📁 Project Structure

```
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── AdminPage.tsx   # Admin panel for testing & import
│   ├── ExamPage.tsx    # Main exam interface
│   ├── LoginPage.tsx   # Authentication
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── data/              # Static data
│   ├── examQuestions.ts # Mock questions
│   └── translations.ts  # Multi-language support
├── supabase/          # Backend
│   └── functions/server/
│       ├── index.tsx   # Main server file
│       ├── questions.tsx # Question API
│       └── kv_store.tsx # Database utility
├── utils/             # Utilities
│   ├── api.ts         # API client
│   └── supabase/      # Supabase config
└── public/
    └── sample-questions.csv # CSV template
```

---

## 🎓 CSV Format Details

### Required Columns (in order):

1. **examType** - `jet`, `small`, `big`, `yacht`, or `navigation`
2. **questionText** - The question
3. **answerA** - First answer option
4. **answerB** - Second answer option
5. **answerC** - Third answer option
6. **answerD** - Fourth answer option
7. **correctAnswer** - `a`, `b`, `c`, `d`, or `a,b,c` for multiple
8. **difficulty** - `1`, `2`, or `3`
9. **imageUrl** - Full URL or leave empty
10. **language** - `English` or `Bulgarian` (optional)

### Example CSV:

```csv
examType,questionText,answerA,answerB,answerC,answerD,correctAnswer,difficulty,imageUrl,language
jet,What is the maximum speed in harbor?,15 knots,20 knots,25 knots,30 knots,a,1,,English
yacht,"Which are required safety items?",Life jackets,Flares,Radio,Sunscreen,a,b,c,2,,English
navigation,What does this sign mean?,Port,Starboard,Danger,Safe,c,2,https://example.com/sign.jpg,English
```

**Tips:**
- Wrap text containing commas in quotes
- Use UTF-8 encoding
- Leave `imageUrl` empty if no image
- For multiple correct answers: `a,b` or `a,c,d`

---

## 📞 Support

**Getting "Invalid login credentials"?**
→ Read the top of this README!

**Need help with import?**
→ Download the sample CSV template from the Admin panel

**Payment issues?**
→ Check webhook configuration in Stripe

**Other questions?**
- Check browser console for errors
- Check Supabase Edge Function logs
- Check Stripe dashboard for payment logs

---

## 🚀 What's Working

✅ Full authentication system  
✅ Stripe payment integration  
✅ Question database with CSV import  
✅ Exam functionality (study & exam modes)  
✅ Mock and paid tiers  
✅ 60-minute timer  
✅ Progress tracking  
✅ Multi-language support  
✅ Dark mode  
✅ Responsive design  
✅ Admin panel for testing  

---

## 🎉 Ready to Go!

Your yacht exam training platform is fully functional. Just:

1. **Create an account** (Admin → Test Auth → Create Demo Account)
2. **Import questions** (Admin → Import Questions)
3. **Configure Stripe webhook** (for real payments)
4. **Start testing!**

Good luck with your yacht training business! 🚤⚓

---

**Note:** This application is for training purposes only. Users do not receive official certification.
