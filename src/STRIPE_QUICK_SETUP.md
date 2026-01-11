# ⚡ Stripe Quick Setup (5 Minutes)

## Your Issue: "Failed to start checkout"

**Cause:** `STRIPE_SECRET_KEY` is not set in Supabase

**Fix:** Add your Stripe API key (takes 5 minutes)

---

## 🎯 Step-by-Step Fix

### Step 1: Get Your Stripe Secret Key (2 minutes)

#### Option A: Use Test Mode (Recommended for now)

1. **Go to Stripe Dashboard:**
   👉 https://dashboard.stripe.com/test/apikeys

2. **Find "Secret key"** section (NOT "Publishable key")

3. **Click "Reveal test key"** - it starts with `sk_test_`

4. **Copy the key** (keep it safe, you'll need it in Step 2)

#### Option B: Use Live Mode (For production later)

1. **Toggle to "Live mode"** in Stripe dashboard (top right)
2. Go to: https://dashboard.stripe.com/apikeys
3. Copy the **Secret key** (starts with `sk_live_`)

---

### Step 2: Add Key to Supabase (2 minutes)

**Run this command in your terminal:**

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Replace `sk_test_YOUR_KEY_HERE` with your actual key from Step 1**

**Example:**
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_51AbCdEf123456789...
```

**Wait for confirmation:**
```
✓ Finished supabase secrets set.
```

---

### Step 3: Restart Backend (1 minute)

Secrets only load when function restarts, so redeploy:

```bash
npx supabase functions deploy server --no-verify-jwt
```

Wait for: `Deployed Function server`

---

### Step 4: Test Checkout Again

1. **Refresh your app** in the browser
2. **Try purchasing a category** again
3. **Should redirect to Stripe checkout** ✅

---

## 🧪 Test Card Numbers (For Testing)

When using test mode, use these card numbers:

**✅ Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**❌ Declined payment (to test errors):**
- Card: `4000 0000 0000 0002`

**More test cards:** https://stripe.com/docs/testing

---

## 🔍 Verify It's Working

After adding the key and redeploying:

**Check logs to confirm Stripe initialized:**
```bash
npx supabase functions logs server
```

**Look for:**
```
Initializing Stripe with key: sk_test...
✓ Stripe initialized successfully
```

**If you see errors:**
- Check that key starts with `sk_test_` or `sk_live_`
- Make sure you copied the full key
- Verify no extra spaces in the command

---

## 🐛 Still Not Working?

### Error: "Missing Stripe secret key"
**Fix:** The secret wasn't set correctly. Try:
```bash
# List current secrets
npx supabase secrets list

# Should show STRIPE_SECRET_KEY
# If not, set it again:
npx supabase secrets set STRIPE_SECRET_KEY=your_key_here
```

### Error: "Invalid API Key"
**Fix:** 
- Make sure you copied the **Secret key** (not Publishable key)
- Secret key starts with `sk_test_` or `sk_live_`
- Publishable key starts with `pk_test_` (wrong one!)

### Checkout redirects but shows error
**Fix:**
- You need to create products in Stripe first
- Go to: https://dashboard.stripe.com/test/products
- Or let me create a script to auto-create them

---

## 📋 Quick Reference Commands

```bash
# Set Stripe key
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Verify it was set
npx supabase secrets list

# Redeploy backend
npx supabase functions deploy server --no-verify-jwt

# Check logs
npx supabase functions logs server

# Test checkout in your app
# (Just click "Purchase" button)
```

---

## ✅ Success Checklist

- [ ] Got Stripe secret key from https://dashboard.stripe.com/test/apikeys
- [ ] Ran: `npx supabase secrets set STRIPE_SECRET_KEY=...`
- [ ] Saw confirmation: "Finished supabase secrets set"
- [ ] Ran: `npx supabase functions deploy server --no-verify-jwt`
- [ ] Saw: "Deployed Function server"
- [ ] Refreshed app in browser
- [ ] Tried checkout again - redirects to Stripe ✅

---

## 🎯 TL;DR - Copy/Paste This

```bash
# 1. Get your key from: https://dashboard.stripe.com/test/apikeys
# 2. Replace YOUR_KEY below and run:

npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
npx supabase functions deploy server --no-verify-jwt

# 3. Refresh your app and try checkout again
```

---

## 🚀 After This Works

You'll be able to:
- ✅ Purchase exam categories
- ✅ Test with fake credit cards
- ✅ See payments in Stripe dashboard
- ✅ Access paid content after payment

**Then we can set up webhooks for automatic subscription activation!**

---

**Run Step 1 now - get your Stripe key and add it!** 🔑
