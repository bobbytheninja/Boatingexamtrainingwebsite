# 💳 Payment Flow Explained

## 🔄 How the Payment System Works

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS PAYMENT PAGE                      │
│                     (PaymentPage.tsx)                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ User selects exam(s)  │
                    │ - Jet Ski (€5)        │
                    │ - Small Boat (€5)     │
                    │ Total: €10/month      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Clicks "Proceed to    │
                    │ Checkout"             │
                    └───────────┬───────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                FRONTEND CALLS BACKEND API                         │
│  api.createCheckoutSession(['jet', 'small'], accessToken)        │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│              BACKEND CREATES STRIPE SESSION                       │
│  POST /create-checkout-session                                    │
│  - Verifies user authentication                                   │
│  - Creates Stripe checkout session                                │
│  - Returns session URL                                            │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Backend returns:      │
                    │ {                     │
                    │   sessionId: "...",   │
                    │   url: "stripe.com..."│
                    │ }                     │
                    └───────────┬───────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│           FRONTEND REDIRECTS TO STRIPE CHECKOUT                   │
│               window.location.href = url                          │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ User on Stripe page   │
                    │ - Secure Stripe UI    │
                    │ - Enters card details │
                    │ - Card: 4242...       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ User clicks "Pay"     │
                    │ Stripe processes      │
                    │ payment               │
                    └───────────┬───────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────┐         ┌───────────────────────┐
    │ Payment SUCCESS   │         │  Payment FAILED       │
    └─────────┬─────────┘         └───────────┬───────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌────────────────────────┐
│ Stripe redirects to:    │     │ Stripe redirects to:   │
│ /payment-success        │     │ /payment (cancel_url)  │
│ ?session_id=xxx         │     │                        │
└─────────┬───────────────┘     └────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────────────────────────┐
│              PAYMENT SUCCESS PAGE LOADS                           │
│                  (PaymentSuccessPage.tsx)                         │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Gets session_id from  │
                    │ URL parameters        │
                    └───────────┬───────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│            FRONTEND VERIFIES PAYMENT                              │
│       api.verifyPayment(sessionId, accessToken)                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│          BACKEND VERIFIES WITH STRIPE                             │
│  GET /verify-payment/:sessionId                                   │
│  - Checks if payment completed                                    │
│  - Returns purchased exam types                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│     BACKEND UPDATES USER SUBSCRIPTION (via Webhook)               │
│  - Adds exam types to user's subscription                         │
│  - Sets expiration date (30 days)                                 │
│  - Stores in KV store                                             │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Frontend shows:       │
                    │ ✅ Payment Successful!│
                    │ Your exams unlocked   │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ User clicks           │
                    │ "Start Practicing"    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Redirected to home    │
                    │ Can now access paid   │
                    │ exam questions        │
                    └───────────────────────┘
```

---

## 🔐 Security Features

### 1. Authentication
- User must be logged in to purchase
- Access token verified on every request
- Only authenticated users can create checkout sessions

### 2. Stripe Security
- No card data touches your servers
- All payment processing by Stripe (PCI compliant)
- Secure redirect to Stripe's checkout page

### 3. Verification
- Payment verified before granting access
- Session ID checked with Stripe API
- Double verification via webhook

### 4. Subscription Validation
- Expiration dates enforced
- Expired subscriptions automatically removed
- Access checked on every exam attempt

---

## 📊 Data Stored

### In Supabase Auth
```javascript
{
  id: "user-uuid",
  email: "user@example.com",
  user_metadata: {
    name: "John Doe"
  }
}
```

### In KV Store (subscription data)
```javascript
// Key: `subscription:${userId}`
{
  examTypes: ['jet', 'small'],
  expiresAt: 1735776000000, // timestamp
  updatedAt: 1733184000000,
  stripeSessionId: "cs_test_...",
  amountPaid: 1000, // in cents (€10)
  currency: "eur"
}
```

---

## 💰 Pricing Logic

### Current Setup
- **Base price:** €5 per exam category per month
- **Multiple exams:** Cumulative (2 exams = €10/month)
- **Subscription period:** 30 days from purchase
- **Renewal:** Not automatic (one-time purchase)

### In Code
```typescript
// Backend: /supabase/functions/server/index.tsx
const pricePerExam = 500; // in cents (€5)
const totalAmount = examTypes.length * pricePerExam;

// Expiration
const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
```

---

## 🧪 Test vs Live Mode

### Test Mode (Current)
- Uses `sk_test_...` secret key
- Test card: `4242 4242 4242 4242`
- No real money charged
- Perfect for development

### Live Mode (Production)
- Uses `sk_live_...` secret key  
- Real cards only
- Real money charged
- Requires activated Stripe account

---

## 🔔 Webhook Events

### What Webhooks Do
When a payment succeeds, Stripe sends a webhook event to your backend:

```javascript
// Event type: checkout.session.completed
{
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_...",
      payment_status: "paid",
      amount_total: 1000,
      currency: "eur",
      metadata: {
        userId: "user-uuid",
        examTypes: "jet,small"
      }
    }
  }
}
```

### Backend Handles It
```typescript
// POST /stripe-webhook
if (event.type === 'checkout.session.completed') {
  // Update user's subscription
  // Grant access to purchased exams
}
```

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `/components/PaymentPage.tsx` | Payment UI and exam selection |
| `/components/PaymentSuccessPage.tsx` | Success page after payment |
| `/supabase/functions/server/index.tsx` | Backend API (lines 420-613) |
| `/utils/api.ts` | API client functions |
| `/contexts/AuthContext.tsx` | User authentication state |

---

## 🔄 Subscription Lifecycle

```
┌─────────────┐
│   No Sub    │ ← User signs up
└──────┬──────┘
       │
       │ User purchases exam
       ▼
┌─────────────┐
│  Active Sub │ ← expiresAt = now + 30 days
│  (30 days)  │
└──────┬──────┘
       │
       │ Time passes...
       ▼
┌─────────────┐
│  Expired    │ ← expiresAt < now
│  (removed)  │
└──────┬──────┘
       │
       │ User purchases again
       ▼
┌─────────────┐
│  Active Sub │ ← New 30-day period
│  (30 days)  │
└─────────────┘
```

---

## 📱 User Experience

### Before Payment
- ❌ Can only access 10 free mock questions
- ✅ Can see what exams are available
- ✅ Can see pricing (€5/month each)

### After Payment
- ✅ Full access to all 40 questions per exam
- ✅ Unlimited attempts
- ✅ Study mode and Exam mode
- ✅ Progress tracking
- ✅ 30 days of access

### After Expiration
- ❌ Access revoked automatically
- ✅ Can purchase again to regain access
- ✅ Progress history retained

---

## 🎨 UI States

### Payment Page
1. **No selection** - Button disabled, "Select at least one exam"
2. **Selected** - Shows total price, button enabled
3. **Processing** - Spinner, "Opening Checkout..."
4. **Redirecting** - Navigates to Stripe

### Success Page
1. **Verifying** - Spinner, "Verifying Payment..."
2. **Success** - ✅ Green checkmark, purchased exams listed
3. **Error** - ❌ Red error message, "Return to Home" button

---

**This flow ensures secure, reliable payment processing while providing a smooth user experience!**
