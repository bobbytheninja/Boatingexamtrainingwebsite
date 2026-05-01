# 💳 Payment Setup - Quick Start

## ⚡ 5-Minute Setup

### 1️⃣ Get Stripe Account (2 min)
1. Go to https://stripe.com
2. Click "Start now" 
3. Sign up with email
4. Verify email

### 2️⃣ Get API Key (1 min)
1. In Stripe Dashboard, click **Developers** → **API keys**
2. Find "Secret key" in Test mode
3. Click **Reveal test key**
4. Copy the key (starts with `sk_test_`)

### 3️⃣ Set Key in Supabase (1 min)
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 4️⃣ Redeploy Backend (1 min)
```bash
npx supabase functions deploy server --no-verify-jwt
```

### ✅ Done! Test it:
1. Open `/test-payment.html` in browser
2. Click "Test Stripe Config"
3. Or test full flow in your app with card: `4242 4242 4242 4242`

---

## 🧪 Test Cards

| Purpose | Card Number | Expiry | CVC | ZIP |
|---------|-------------|--------|-----|-----|
| ✅ **Success** | `4242 4242 4242 4242` | 12/34 | 123 | 12345 |
| ❌ **Decline** | `4000 0000 0000 0002` | 12/34 | 123 | 12345 |

---

## 🔍 Quick Checks

**Is backend healthy?**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw" https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
```

**Are secrets set?**
```bash
npx supabase secrets list
```

**Check backend logs:**
1. Go to https://supabase.com/dashboard/project/abtrsjhvjfgcxxpkszwi/functions
2. Click on "server" function
3. Click "Logs" tab

---

## 🎯 Full Test Flow

1. **Sign up** for an account in your app
2. **Go to Payment** page
3. **Select** "Jet Ski" exam (or any category)
4. **Click** "Proceed to Checkout" 
5. **Use test card:** `4242 4242 4242 4242`
6. **Complete** payment
7. **Verify** you're redirected back with success message
8. **Check** your account shows active subscription

---

## ❗ Common Errors

### "Payment system unavailable - Stripe not configured"
→ Stripe key not set. Run step 3 again.

### "Missing authorization header"  
→ Log out and log back in to refresh your token.

### Backend shows "Stripe not initialized"
→ Redeploy backend after setting secrets (step 4).

---

## 📁 Test Files Created

- **`/test-payment.html`** - Interactive payment system tester
- **`/test-health.html`** - Backend health checker
- **`/STRIPE_SETUP_GUIDE.md`** - Complete documentation

---

## 🚀 Going Live (Later)

When ready for real payments:
1. Activate Stripe account (add business info)
2. Switch to **Live mode** in Stripe Dashboard
3. Get **Live** API key (`sk_live_...`)
4. Update secret: `npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
5. Redeploy backend
6. Test with real card (charges will be real!)

---

## 💰 Current Pricing

- €5 per month per exam category
- 30-day access period
- Unlimited attempts during subscription

---

**Need help?** Check `/STRIPE_SETUP_GUIDE.md` for detailed instructions.
