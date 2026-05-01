# 🔐 Stripe Payment Setup Guide

## Current Status
✅ Payment UI is complete (PaymentPage.tsx)
✅ Success page is ready (PaymentSuccessPage.tsx)
✅ Backend integration is coded (Stripe checkout & webhooks)
✅ API calls are configured (api.ts)

⚠️ **What's Missing:** Stripe API keys need to be configured

---

## Step 1: Get Your Stripe API Keys

### 1.1 Sign up for Stripe
1. Go to https://stripe.com
2. Click "Sign up" or "Start now"
3. Create an account (it's free)
4. Verify your email

### 1.2 Get Test Mode Keys (for development)
1. Log in to your Stripe Dashboard
2. Click on "Developers" in the top menu
3. Click "API keys" in the left sidebar
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

⚠️ **Important:** Keep your secret key private! Never commit it to Git.

---

## Step 2: Configure Stripe Keys in Supabase

### 2.1 Set the Secret Key
Run this command in your terminal (replace with your actual key):

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 2.2 Verify the Secret is Set
```bash
npx supabase secrets list
```

You should see `STRIPE_SECRET_KEY` in the list.

---

## Step 3: Set Up Stripe Webhook (for Production)

Webhooks allow Stripe to notify your backend when a payment succeeds.

### 3.1 Get Your Backend URL
Your webhook endpoint is:
```
https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/stripe-webhook
```

### 3.2 Create a Webhook in Stripe Dashboard
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL (above)
4. Select events to listen for:
   - ✅ `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### 3.3 Set the Webhook Secret in Supabase
```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

---

## Step 4: Redeploy the Backend

After setting the secrets, redeploy the backend:

```bash
npx supabase functions deploy server --no-verify-jwt
```

---

## Step 5: Test the Payment Flow

### 5.1 Use Stripe Test Cards
When testing, use these test card numbers:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Decline:**
- Card: `4000 0000 0000 0002`

More test cards: https://stripe.com/docs/testing

### 5.2 Test Flow
1. Log in to your app
2. Go to Payment page
3. Select exam categories
4. Click "Proceed to Checkout"
5. You should be redirected to Stripe Checkout
6. Use test card `4242 4242 4242 4242`
7. Complete payment
8. You should be redirected back to success page
9. Your subscription should be active!

---

## Step 6: Production Setup (When Ready)

### 6.1 Activate Your Stripe Account
1. Complete business information in Stripe Dashboard
2. Add bank account details
3. Submit for review

### 6.2 Switch to Live Mode
1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Get your **Live** API keys:
   - Secret key (starts with `sk_live_`)
3. Update Supabase secrets:
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
   ```
4. Update webhook endpoint to use live mode
5. Get new webhook secret for live mode
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
   ```
6. Redeploy backend

---

## Troubleshooting

### Payment fails with "Stripe not initialized"
- Check that `STRIPE_SECRET_KEY` is set in Supabase
- Redeploy the backend after setting secrets
- Check backend logs in Supabase Dashboard → Functions → server → Logs

### Webhook not receiving events
- Verify webhook URL is correct
- Check that `checkout.session.completed` event is selected
- Test webhook using "Send test webhook" in Stripe Dashboard

### "Payment system unavailable"
- Backend is not deployed or crashed
- Check Supabase Functions logs
- Verify Stripe key is valid

---

## Quick Start Commands

```bash
# 1. Set Stripe secret key
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# 2. Set webhook secret (optional for local testing)
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# 3. Redeploy backend
npx supabase functions deploy server --no-verify-jwt

# 4. Test the health endpoint with auth
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw" https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
```

---

## Pricing Information

Current setup:
- **€5 per month** per exam category
- **30-day access** per purchase
- **Unlimited attempts** during subscription period

This is configured in `/supabase/functions/server/index.tsx` around line 456:
```typescript
const pricePerExam = 500; // in cents (€5)
```

To change pricing, modify this value and redeploy.

---

## Next Steps After Payment Setup

1. ✅ Set up Stripe test keys
2. ✅ Test payment flow with test cards
3. 🔄 Get real Stripe account approved (takes 1-2 days)
4. 🔄 Switch to live keys
5. 🚀 Launch!

---

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Test Cards: https://stripe.com/docs/testing
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
