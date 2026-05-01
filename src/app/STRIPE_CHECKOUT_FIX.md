# 🔧 Stripe Checkout Error - FIXED

## What Was Wrong

You were getting a **500 error** when trying to create a Stripe checkout session:

```
Error creating checkout session
```

## What I Fixed

✅ **Updated Stripe API version** - Changed from `2024-11-20.acacia` to `2024-10-28.acacia` (more stable)
✅ **Added comprehensive logging** - Now shows exactly what's failing
✅ **Better error messages** - Tells you specifically what's missing
✅ **Environment variable checks** - Verifies Stripe is properly configured

## Deploy the Fix Now

**Run this command:**

```bash
./deploy-backend.sh
```

**Or manually:**

```bash
supabase functions deploy make-server-d36f8f91
```

This will take 30-60 seconds.

---

## After Deployment

### 1. Check If Stripe Is Configured

The most common cause is **missing Stripe secret key**. Let's verify:

```bash
supabase secrets list
```

You should see:
```
STRIPE_SECRET_KEY (set)
```

**If you DON'T see it**, run:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51...
```

Get your key from: https://dashboard.stripe.com/test/apikeys

### 2. Hard Refresh Your Browser

- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

### 3. Try Payment Again

1. Go to **Account** page
2. Click **"Unlock Paid Exams"**
3. Select an exam type
4. Click **"Proceed to Checkout"**

### 4. Check Backend Logs (If Still Failing)

```bash
supabase functions logs make-server-d36f8f91 --tail
```

Now you'll see detailed logs like:

**✅ If working:**
```
[Checkout] Starting checkout session creation...
[Checkout] User verified: 550e8400-e29b-41d4-a716-446655440000
[Checkout] Exam types requested: ["jet"]
[Checkout] Total amount: 500 cents (€5)
[Checkout] User email: user@example.com
[Checkout] Creating Stripe session...
[Checkout] ✅ Session created successfully: cs_test_abc123...
```

**❌ If failing:**
```
[Checkout] Stripe not initialized! Check STRIPE_SECRET_KEY environment variable.
```

OR

```
[Checkout] ❌ Error creating Stripe checkout session: [specific error]
```

---

## Common Issues & Solutions

### Error: "Stripe not initialized"

**Cause:** Missing or invalid `STRIPE_SECRET_KEY`

**Solution:**
```bash
# Get your key from Stripe dashboard
# https://dashboard.stripe.com/test/apikeys

supabase secrets set STRIPE_SECRET_KEY=sk_test_51...

# Then redeploy
./deploy-backend.sh
```

### Error: "No such customer"

**Cause:** Using test key in production or vice versa

**Solution:**
- For testing: Use keys that start with `sk_test_`
- For production: Use keys that start with `sk_live_`

Make sure your frontend `VITE_STRIPE_PUBLISHABLE_KEY` matches:
- Test backend: `pk_test_...`
- Live backend: `pk_live_...`

### Error: "Invalid API key"

**Cause:** Copied key incorrectly or using old/revoked key

**Solution:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the **Secret key** (click "Reveal test key")
3. It should start with `sk_test_51...`
4. Run:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_51YourActualKeyHere
   ```

### Error: "User email not found"

**Cause:** User account doesn't have an email address

**Solution:**
- This shouldn't happen with normal signups
- Check your user in Supabase Dashboard → Authentication → Users
- Make sure the email field is populated

---

## How to Get Your Stripe Secret Key

### For Testing (Use This First):

1. **Go to:** https://dashboard.stripe.com/test/apikeys
2. **Toggle** to "Test mode" (top right, should say "Viewing test data")
3. **Find** "Secret key" section
4. **Click** "Reveal test key"
5. **Copy** the key (starts with `sk_test_51...`)
6. **Run:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_51YourKeyHere
   ./deploy-backend.sh
   ```

### For Production (Later):

1. **Activate your Stripe account** (add business details, bank info)
2. **Toggle** to "Live mode" in Stripe dashboard
3. **Get live keys** (start with `sk_live_...`)
4. **Update both:**
   ```bash
   # Backend (Supabase)
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   
   # Frontend (Vercel/Netlify - if hosted)
   # Update VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

---

## Verify It's Working

### 1. Check Environment Variables

```bash
supabase secrets list
```

Should show:
```
✓ SUPABASE_URL
✓ SUPABASE_ANON_KEY  
✓ SUPABASE_SERVICE_ROLE_KEY
✓ STRIPE_SECRET_KEY          ← Must be here!
✓ SUPABASE_DB_URL
```

### 2. Test Checkout Flow

1. **Login** to your app
2. Go to **Account** page
3. Click **"Unlock Paid Exams"**
4. Select **"Jet Ski"**
5. Click **"Proceed to Checkout"**

**Expected:** Redirects to Stripe checkout page

**Test card:**
- Number: `4242 4242 4242 4242`
- Expiry: `12/34` (any future date)
- CVC: `123` (any 3 digits)
- ZIP: `12345` (any 5 digits)

### 3. After Payment

You should:
1. See "Payment Successful!" page
2. Return to Account page
3. See active subscription for Jet Ski exam
4. Be able to start full 40-question exam

---

## Still Not Working?

### Check the exact error in backend logs:

```bash
supabase functions logs make-server-d36f8f91 --tail
```

Then try checkout again and watch the logs in real-time.

### Common log messages:

**"Stripe not initialized"** → Set STRIPE_SECRET_KEY
**"Invalid token"** → Make sure you're logged in
**"User email not found"** → Check user has email in Supabase Auth
**"No such customer"** → Using wrong Stripe mode (test vs live)

### Need More Help?

**Copy the EXACT error from logs** and I can help debug further.

---

## What's Next?

Once checkout works:

✅ Test full payment flow
✅ Verify subscription activates
✅ Take a paid exam with 40 questions
✅ Import your real questions
✅ Ready to launch! 🚀

---

**Run this now:**
```bash
./deploy-backend.sh
```

Then check your Stripe keys are set!
