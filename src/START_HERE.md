# 🚨 START HERE - Fix Your Issues

## ✅ Backend is Working! (Login works now)

## 🚨 NEW ISSUE: "Failed to start checkout"

**Cause:** Stripe API key is not configured yet

**Fix:** Takes 5 minutes - follow below

---

## 🎯 Goal: Set Up Stripe Payments (5 minutes)

---

## 🚀 Quick Fix - Add Stripe Key:

### Step 1: Get Stripe Secret Key (2 minutes)

1. **Go to Stripe Dashboard:**
   👉 https://dashboard.stripe.com/test/apikeys

2. **Find "Secret key"** (NOT "Publishable key")

3. **Click "Reveal test key"** - starts with `sk_test_`

4. **Copy it** (you'll need it in Step 2)

### Step 2: Add to Supabase (2 minutes)

Run this in your terminal (replace with your actual key):

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Wait for:** `✓ Finished supabase secrets set`

### Step 3: Restart Backend (1 minute)

```bash
npx supabase functions deploy server --no-verify-jwt
```

**Wait for:** `Deployed Function server`

### Step 4: Test Checkout

1. **Open `test-stripe.html`** in your browser ⭐
2. **Click "Test Checkout Endpoint"**
3. **Should show** ✅ Stripe is configured
4. **Try purchasing** in your app - should redirect to Stripe!

---

## 🧪 Testing Payments

Use these test cards in Stripe checkout:

**✅ Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: `12/25` (any future date)
- CVC: `123` (any 3 digits)
- ZIP: `12345` (any 5 digits)

**❌ Declined payment:**
- Card: `4000 0000 0000 0002`

More test cards: https://stripe.com/docs/testing

---

## 📁 Files to Help You:

| File | Purpose |
|------|---------|
| **`test-stripe.html`** | 👈 Test if Stripe is working ⭐ |
| **`STRIPE_QUICK_SETUP.md`** | Detailed Stripe setup guide |
| `diagnose-backend.html` | Test backend health |
| `START_HERE.md` | 👈 This file |
| `FIX_BACKEND_NOW.md` | Backend troubleshooting |

---

## 📋 Complete Checklist

### ✅ Backend (Already Done!)
- [x] Unpaused Supabase project
- [x] Deployed backend
- [x] Login working

### 🔲 Stripe (Do This Now!)
- [ ] Got Stripe key from https://dashboard.stripe.com/test/apikeys
- [ ] Ran: `npx supabase secrets set STRIPE_SECRET_KEY=...`
- [ ] Saw: "Finished supabase secrets set"
- [ ] Ran: `npx supabase functions deploy server --no-verify-jwt`
- [ ] Opened `test-stripe.html` - shows ✅
- [ ] Tried checkout in app - redirects to Stripe ✅

---

## 🐛 Troubleshooting

### "Failed to start checkout" persists
1. **Verify secret is set:**
   ```bash
   npx supabase secrets list
   ```
   Should show `STRIPE_SECRET_KEY`

2. **Check backend logs:**
   ```bash
   npx supabase functions logs server
   ```
   Look for "Stripe initialized" or errors

3. **Open `test-stripe.html`** - it will tell you exactly what's wrong

### Can't find Stripe key
- Make sure you're in **Test mode** (toggle in top right of Stripe dashboard)
- Look for **"Secret key"** section (NOT "Publishable key")
- Key starts with `sk_test_` (test) or `sk_live_` (production)

---

## ⚡ TL;DR - Copy/Paste

```bash
# 1. Get key from: https://dashboard.stripe.com/test/apikeys
# 2. Replace YOUR_KEY and run:

npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
npx supabase functions deploy server --no-verify-jwt

# 3. Open test-stripe.html in browser to verify
# 4. Try checkout in your app!
```

---

## 🎯 After Stripe Works

You'll be able to:
- ✅ Purchase exam categories
- ✅ Test with fake credit cards  
- ✅ See payments in Stripe dashboard
- ✅ Access paid content

Then we can set up webhooks for automatic subscription activation!

---

**Add your Stripe key now - should work in 5 minutes!** 🚀