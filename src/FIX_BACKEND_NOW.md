# 🔧 Fix Backend - Deployment Guide

## You're Right - Let's Fix This Properly!

The workaround won't cut it. You need the backend running for:
- ✅ User authentication & signup
- ✅ Subscription management
- ✅ Payment processing (Stripe)
- ✅ Question fetching
- ✅ Admin functions

---

## 🔍 Step 1: Check if Backend is Deployed

Run this command to see deployed functions:

```bash
npx supabase functions list
```

**Expected output:**
```
NAME    VERSION  CREATED AT
server  v1       2024-XX-XX XX:XX:XX
```

If you see `server` listed, it's deployed. If not, we need to deploy it.

---

## 🚀 Step 2: Deploy/Redeploy the Backend

### Option A: First Time Deployment

If you've never deployed or need to link your project:

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to your project
npx supabase link --project-ref abtrsjhvjfgcxxpkszwi

# 3. Deploy the function
npx supabase functions deploy server --no-verify-jwt
```

### Option B: Just Redeploy (if already linked)

```bash
npx supabase functions deploy server --no-verify-jwt
```

**Wait for deployment to complete** (30 seconds - 2 minutes)

---

## ✅ Step 3: Test the Backend

### Test 1: Health Check

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw" \
  https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "environment": "production"
}
```

### Test 2: Open test-health.html

1. Open `/test-health.html` in your browser
2. Click "Test Health Endpoint"
3. Should show ✅ Backend is healthy

---

## 🐛 Step 4: Check Backend Logs

If deployment succeeded but tests fail, check the logs:

### In Terminal:
```bash
npx supabase functions logs server
```

### In Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/abtrsjhvjfgcxxpkszwi/functions
2. Click on "server" function
3. Click "Logs" tab
4. Look for errors

---

## 🔑 Step 5: Verify Environment (After Testing)

Once backend is healthy, verify these are set (optional for now, required for payments):

```bash
npx supabase secrets list
```

Should eventually show:
- `STRIPE_SECRET_KEY` (needed for payments)
- `STRIPE_WEBHOOK_SECRET` (optional for now)

---

## 🚨 Common Issues & Fixes

### Issue 1: "Command not found: supabase"
**Fix:** Install Supabase CLI:
```bash
npm install -g supabase
```

### Issue 2: "Not logged in"
**Fix:**
```bash
npx supabase login
```
Follow the browser prompt to authenticate.

### Issue 3: "Project not linked"
**Fix:**
```bash
npx supabase link --project-ref abtrsjhvjfgcxxpkszwi
```

### Issue 4: Deployment hangs or fails
**Fix:**
1. Check your internet connection
2. Make sure you're logged in: `npx supabase login`
3. Try again with verbose logging:
   ```bash
   npx supabase functions deploy server --no-verify-jwt --debug
   ```

### Issue 5: Backend deployed but health check fails
**Possible causes:**
1. Function is still starting up (wait 30 seconds)
2. Check logs: `npx supabase functions logs server`
3. Redeploy: `npx supabase functions deploy server --no-verify-jwt`

### Issue 6: "Login failed" in your app
**After backend is healthy, try:**
1. Clear browser cache and cookies
2. Open browser console (F12) and check for errors
3. Try signing up with a NEW email (not one you used before)
4. Check if error message gives specific details

---

## 📋 Complete Deployment Checklist

Run these commands in order:

```bash
# 1. Make sure you're logged in
npx supabase login

# 2. Link to your project (if not already linked)
npx supabase link --project-ref abtrsjhvjfgcxxpkszwi

# 3. Deploy the backend
npx supabase functions deploy server --no-verify-jwt

# 4. Test health endpoint
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw" \
  https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health

# 5. Check logs if needed
npx supabase functions logs server
```

---

## ✅ Success Criteria

Backend is properly running when:
- [ ] `npx supabase functions list` shows "server"
- [ ] Health check returns `{"status":"ok"}`
- [ ] `/test-health.html` shows ✅ Backend is healthy
- [ ] You can sign up with a new email
- [ ] You can log in with existing credentials
- [ ] No errors in browser console during login

---

## 🎯 After Backend is Running

Once everything above passes:
1. ✅ Try logging in again - should work!
2. ✅ Set up Stripe keys (see `FINISH_PAYMENT_TODAY.md`)
3. ✅ Test payment flow
4. ✅ Ready for deployment tomorrow!

---

## 📞 Quick Reference

**Your Project ID:** `abtrsjhvjfgcxxpkszwi`

**Backend URL:** `https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91`

**Health Endpoint:** `https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health`

**Dashboard:** https://supabase.com/dashboard/project/abtrsjhvjfgcxxpkszwi

---

**Start with Step 1 and work through the checklist!**

Once deployment succeeds, your login should work immediately.
