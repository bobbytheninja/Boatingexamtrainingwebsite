# 🔧 DEPLOY THE DUPLICATE QUESTION FIX

## ✅ What Was Fixed
The "ON CONFLICT DO UPDATE command cannot affect row a second time" error has been fixed!

**Root Cause:** Your Excel file had duplicate question numbers, which created duplicate IDs (like `yacht_301` appearing twice) in the same batch.

**Solution:** The backend now deduplicates questions by ID before saving them to the database.

---

## 🚀 STEP 1: Deploy the Fixed Backend

Run this command from your project root:

```bash
npx supabase functions deploy server --no-verify-jwt
```

**Watch for:** "Deployed successfully" message

---

## 🧪 STEP 2: Test the Upload

1. Go to your admin panel: **`/admin`**
2. Click the **"Import Questions"** tab
3. Select exam type: **yacht**
4. Upload your Excel file
5. Enter admin key: **`change-this-key`**
6. Click **"Import Questions"**

---

## 📊 Expected Result

You should see:
- ✅ Success message
- ⚠️ Log message: "Removed X duplicate questions" (if duplicates exist)
- ✅ "Successfully imported Y questions"

If duplicates were found, the system will automatically remove them and import only unique questions.

---

## 🔍 Check Supabase Logs

After import, check: **https://supabase.com/dashboard/project/abtrsjhvjfgcxxpkszwi/functions/server/logs**

Look for:
```
[Questions] ⚠️ Removed 5 duplicate questions. Processing 595 unique questions.
[Questions] Import complete! Total questions: 600
```

---

## 💡 How to Prevent Duplicates in Your Excel

Make sure your Excel file has:
- **Unique question numbers in column 1** (no duplicates like 1, 1, 2, 2, etc.)
- **No empty rows in the middle** of your data
- **Sequential numbering** (1, 2, 3, 4... not 1, 1, 3, 3...)

The system will now handle duplicates automatically, but clean data = faster imports!

---

## 🎯 DEPLOY NOW!

```bash
npx supabase functions deploy server --no-verify-jwt
```

Then test the import! 🚀
