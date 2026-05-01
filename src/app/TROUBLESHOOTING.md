# 🔧 Troubleshooting: Mock Questions Error

## Error You're Seeing:
```
[ExamPage] Failed to load mock questions: Error: Error fetching mock questions
```

## What This Means:

The frontend is trying to fetch mock questions from the backend, but something is failing. There are 3 possible causes:

---

## ⚠️ **Most Likely Cause: Backend Not Deployed**

### Symptom:
You see this error when trying to start a mock exam.

### Why:
The backend endpoints I created (`/questions/:examType/mock`) don't exist yet because you haven't deployed the backend.

### Solution:
**Deploy the backend:**

```bash
# Mac/Linux:
chmod +x deploy-backend.sh
./deploy-backend.sh

# Windows:
deploy-backend.bat
```

When prompted for "Admin Import Key", type any secure password (e.g., `YachtAdmin2024!`).

After deployment completes, test again.

---

## 🧪 **How to Test if Backend is Deployed**

### Test 1: Health Check
Open this URL in your browser:
```
https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2024-11-09T...","version":"1.0.0"}
```

**If you get an error:** Backend is not deployed.

### Test 2: Admin Panel Test
1. Go to your site
2. Log in as admin
3. Go to Admin Panel
4. Click "API Keys" tab
5. Click "Test Server Connection"

**Expected result:** ✅ Server is running! Status: ok

**If you get 401 or error:** Backend is not deployed.

### Test 3: Mock Questions Endpoint
Open this URL in your browser (replace `jet` with any exam type):
```
https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/questions/jet/mock
```

**If backend is deployed but no questions imported:**
```json
{"message":"No questions available for this exam type"}
```

**If backend is not deployed:**
```
Function not found
```
or network error.

---

## 📦 **Other Possible Causes**

### 2. Questions Not Imported Yet

**Symptom:** Backend is deployed, health check works, but mock exam shows "demo questions" warning.

**Solution:**
1. Go to Admin Panel
2. Go to "Import Questions" tab
3. Enter admin key (the password you chose during backend deployment)
4. Select exam type (e.g., "Jet Ski")
5. Upload your Excel/CSV file
6. Click "Import Questions"
7. Repeat for all 5 exam types

**Verify:** Go to "Diagnostics" tab and check question counts show 120+ for each exam type.

### 3. Network/CORS Issue

**Symptom:** Backend is deployed, questions are imported, but still getting errors.

**Check browser console:**
```
Right-click → Inspect → Console tab
```

Look for:
- `CORS error` - This shouldn't happen with our setup, but if it does, it's a Supabase config issue
- `401 Unauthorized` - Backend is deployed but authentication is failing
- `404 Not Found` - Backend deployed but endpoint path is wrong

**Solution:** Share the console error with me and I'll help debug.

---

## ✅ **Current Behavior (WITH Fallback)**

Even if the backend isn't deployed or questions aren't imported, the app **will still work** using demo questions:

1. User clicks "Start Mock Exam"
2. Frontend tries to fetch from backend
3. **If it fails:** Falls back to local demo questions
4. Shows warning toast: "⚠️ Using demo questions..."
5. Exam works with 10 hardcoded questions

This is a **safety feature** so your app doesn't break!

---

## 🎯 **Expected Behavior (AFTER Backend Deployed + Questions Imported)**

1. User clicks "Start Mock Exam" for "Jet Ski"
2. Frontend calls `/questions/jet/mock`
3. Backend fetches questions from database
4. Backend sorts by question number
5. Backend returns questions 1-10
6. User sees **your actual exam questions** (not demo)
7. No warning toast
8. Questions match your Excel file

---

## 🚀 **Quick Fix Checklist**

Run through these in order:

1. [ ] **Deploy Backend**
   ```bash
   ./deploy-backend.sh  # Mac/Linux
   deploy-backend.bat   # Windows
   ```

2. [ ] **Test Health Check**
   - Visit: https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
   - Should see: `{"status":"ok",...}`

3. [ ] **Import Questions**
   - Admin Panel → Import Questions
   - Upload Excel for each exam type
   - Verify in Diagnostics tab

4. [ ] **Test Mock Exam**
   - Log out (or use incognito)
   - Click any exam type
   - Click "Start Mock Exam"
   - Should see your real questions (not demo)
   - No warning toast

---

## 📊 **What the Console Logs Tell You**

When you try to start a mock exam, check the browser console:

### Good (Backend Working):
```
[ExamPage] Loading mock questions for exam type: jet
[ExamPage] Received 10 mock questions from API
[ExamPage] Successfully converted 10 mock questions
```

### Backend Not Deployed:
```
[ExamPage] Loading mock questions for exam type: jet
[API] Network error: {...}
[ExamPage] Failed to load mock questions: Error: Network error...
[ExamPage] Error loading mock questions, using local fallback
```

### Backend Deployed, No Questions:
```
[ExamPage] Loading mock questions for exam type: jet
[API] Request failed: status 404, error: No questions available...
[ExamPage] Failed to load mock questions: Error: No questions available...
[ExamPage] Error loading mock questions, using local fallback
```

---

## 💡 **Pro Tips**

1. **Deploy Backend First:** Everything requires the backend to be deployed. Do this FIRST.

2. **Check Supabase Dashboard:** 
   - Go to: https://supabase.com/dashboard/project/abtrsjhvjfgcxxpkszwi
   - Click "Edge Functions"
   - Should see `server` function listed
   - Status should be "Healthy"

3. **Test Locally First:**
   ```bash
   npm run dev
   ```
   Then test mock exams at http://localhost:5173

4. **Import Questions in Order:**
   - Import Jet Ski questions first
   - Test mock exam for Jet Ski
   - If it works, import the rest

5. **Clear Cache:** If you deployed backend but still see errors:
   ```
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache
   ```

---

## 🆘 **Still Not Working?**

If you've:
- ✅ Deployed the backend
- ✅ Health check returns 200 OK
- ✅ Imported questions via Admin Panel
- ✅ Verified question counts in Diagnostics
- ❌ Still getting errors

**Share with me:**
1. Full console error (from browser console)
2. Response from health check URL
3. Screenshot of Diagnostics tab showing question counts
4. Screenshot of Supabase Edge Functions dashboard

I'll help you debug!

---

## 📝 **Commands Reference**

### Deploy Backend:
```bash
# Mac/Linux
chmod +x deploy-backend.sh
./deploy-backend.sh

# Windows
deploy-backend.bat
```

### Test Health Check:
```bash
curl https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
```

### Test Mock Questions:
```bash
curl https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/questions/jet/mock
```

---

**Bottom Line:** The error is expected if you haven't deployed the backend yet. Deploy it, then the error will go away! 🚀
