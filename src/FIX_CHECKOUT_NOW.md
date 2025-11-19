# 🚨 FIX CHECKOUT - DO THIS RIGHT NOW

## Why You're Not Seeing Credit Card Page

**Expected:** Click "Proceed to Checkout" → Redirects to Stripe → Enter card details

**Actually happening:** Click "Proceed to Checkout" → Error → Stays on same page

## The Problem

The backend is **failing to create a Stripe checkout session** due to a 500 error. This means:
- ❌ No Stripe session is created
- ❌ No redirect URL is generated
- ❌ You never get to the credit card entry page

## The Solution - 3 Steps

### Step 1: Deploy the Backend Fix

I just fixed the Stripe integration with better error handling. Deploy it now:

```bash
./deploy-backend.sh
```

**Wait 30-60 seconds** for deployment to complete.

---

### Step 2: Verify Stripe Secret Key is Set

The most common cause is missing Stripe credentials.

**Check if it's set:**
```bash
supabase secrets list
```

**You should see:**
```
✓ STRIPE_SECRET_KEY (set)
```

**If it's NOT there, add it:**

1. **Get your Stripe TEST key:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Make sure you're in **TEST MODE** (toggle top-right should say "Viewing test data")
   - Find "Secret key" section
   - Click "Reveal test key"
   - Copy the key (starts with `sk_test_51...`)

2. **Add it to Supabase:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_51YourActualKeyHere
   ```

3. **Redeploy backend:**
   ```bash
   ./deploy-backend.sh
   ```

---

### Step 3: Test Again

1. **Hard refresh your browser:**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **Check browser console:**
   - Press `F12` or right-click → "Inspect" → "Console" tab
   - Keep it open

3. **Try checkout again:**
   - Go to Account page
   - Click "Unlock Paid Exams"
   - Select "Jet Ski" (or any exam)
   - Click "Proceed to Checkout"

4. **Watch the console for logs**

---

## What Should Happen (When Working)

### Step-by-step checkout flow:

1. **You click "Proceed to Checkout"**
   - Button shows: "Opening Checkout..."
   - Loading spinner appears

2. **Backend creates Stripe session** (takes 1-2 seconds)
   - Your browser makes API call to Supabase
   - Supabase creates checkout session with Stripe
   - Returns a URL like: `https://checkout.stripe.com/c/pay/cs_test_abc123...`

3. **Browser redirects to Stripe**
   - You leave your site temporarily
   - You see **Stripe's checkout page** (white/blue design)
   - Shows: 
     - Your email
     - Selected exam(s)
     - Total price (€5 or more)
     - Credit card form

4. **You enter card details on Stripe's page:**
   ```
   Card number: 4242 4242 4242 4242
   Expiry: 12/34 (any future date)
   CVC: 123 (any 3 digits)
   Name: Test User
   ```

5. **Click "Pay €5" (or total amount)**

6. **Stripe processes payment** (takes 2-3 seconds)

7. **Redirects back to your site**
   - URL: `https://yoursite.com/payment-success?session_id=cs_test_...`
   - Shows "Payment Successful!" message

8. **Subscription activated**
   - You can now take the full 40-question exam

---

## If It Still Doesn't Work

### A. Check Backend Logs

```bash
supabase functions logs make-server-d36f8f91 --tail
```

Keep this running in one terminal, then try checkout in your browser.

**Look for these messages:**

✅ **Working:**
```
[Checkout] Starting checkout session creation...
[Checkout] User verified: abc-123-def...
[Checkout] Exam types requested: ["jet"]
[Checkout] Creating Stripe session...
[Checkout] ✅ Session created successfully: cs_test_abc123...
```

❌ **Not working:**
```
[Checkout] Stripe not initialized! Check STRIPE_SECRET_KEY
```

OR

```
[Checkout] ❌ Error creating Stripe checkout session: [error details]
```

### B. Common Errors & Solutions

**Error: "Stripe not initialized"**
→ `STRIPE_SECRET_KEY` is not set
→ Run: `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

**Error: "Invalid API key"**
→ Wrong Stripe key or typo
→ Go to https://dashboard.stripe.com/test/apikeys
→ Copy the **Secret key** again (not Publishable key!)
→ Set it: `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

**Error: "No such customer"**
→ Using production key in test mode or vice versa
→ Make sure you're using `sk_test_...` (not `sk_live_...`)

**Error: "User email not found"**
→ Your user account has no email
→ Check: Supabase Dashboard → Authentication → Users
→ Your user should have an email

---

## Quick Checklist

Before trying again, verify:

- [ ] Backend deployed: `./deploy-backend.sh` ✅
- [ ] Stripe key is set: `supabase secrets list` should show STRIPE_SECRET_KEY ✅
- [ ] Using TEST key: starts with `sk_test_51...` ✅
- [ ] Browser refreshed: `Cmd+Shift+R` or `Ctrl+Shift+R` ✅
- [ ] Logged in to your app ✅
- [ ] Selected at least one exam ✅

---

## Visual Guide: What Stripe Checkout Looks Like

When working correctly, you'll see **Stripe's payment page** that looks like this:

```
┌─────────────────────────────────────────┐
│  ← Back                    [Stripe Logo]│
│                                         │
│  Pay Yacht Exam Trainer                │
│                                         │
│  test@example.com                       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Yacht Exam Training - jet         │ │
│  │ 30-day access                 €5  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Card information                       │
│  ┌───────────────────────────────────┐ │
│  │ 4242 4242 4242 4242              │ │
│  └───────────────────────────────────┘ │
│  ┌──────────────┬────────────────────┐ │
│  │ MM / YY      │ CVC               │ │
│  │ 12 / 34      │ 123               │ │
│  └──────────────┴────────────────────┘ │
│                                         │
│  Cardholder name                        │
│  ┌───────────────────────────────────┐ │
│  │ Test User                         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [        Pay €5        ]              │
│                                         │
│  🔒 Secure payment • Powered by Stripe │
└─────────────────────────────────────────┘
```

**You should see THIS PAGE** - not your own site!

---

## Right Now - Do This:

```bash
# 1. Deploy the backend
./deploy-backend.sh

# 2. Check if Stripe key is set
supabase secrets list

# 3. If NOT set, add it:
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# 4. If you just added it, deploy again:
./deploy-backend.sh
```

Then refresh browser and try checkout!

---

## Still Stuck?

**Tell me:**

1. What you see when you run: `supabase secrets list`
2. What happens when you click "Proceed to Checkout"
3. Any errors in browser console (F12)
4. Any errors in backend logs: `supabase functions logs make-server-d36f8f91 --tail`

I'll help you debug! 🚀
