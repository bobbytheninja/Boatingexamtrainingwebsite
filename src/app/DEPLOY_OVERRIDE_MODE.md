# 🔄 OVERRIDE MODE ENABLED - IMPORT REPLACES ALL QUESTIONS

## ✅ What Changed

The import behavior now **REPLACES ALL** questions for the exam type:

### Before:
❌ Import merged with existing questions (caused duplicates)

### After:
✅ **Import deletes old questions → Adds new questions**

---

## 📋 How It Works

When you import questions for "yacht":

1. 🗑️ **Delete** all existing yacht questions from database
2. ✨ **Import** your new questions
3. 🎯 **Result**: Database has ONLY your new questions

**Other exam types are NOT affected!** (If you import yacht, jet/small/big/navigation remain unchanged)

---

## 🚀 DEPLOY NOW

```bash
npx supabase functions deploy server --no-verify-jwt
```

---

## 🧪 Test the Override

1. Go to **`/admin`** → **"Database Diagnostics"** tab
2. Note the current question count for "yacht" (e.g., 600 questions)
3. Go to **"Import Questions"** tab
4. Upload a NEW yacht Excel file with different questions (e.g., 40 questions)
5. Click **"Import Questions"**
6. Go back to **"Database Diagnostics"**
7. ✅ **You should see 40 questions** (not 640!)

---

## 📊 What You'll See in Logs

```
[Questions] 🗑️ Deleting all existing questions for exam type: yacht...
[Questions] Found 600 existing questions to delete
[Questions] Deleted batch 1/12
[Questions] Deleted batch 2/12
...
[Questions] ✅ Deleted all 600 questions for yacht
[Questions] Saving batch 1/1 (40 questions)...
[Questions] Import complete! Total questions: 40
```

---

## ⚠️ Important Notes

- **This is destructive!** Old questions are permanently deleted before import
- **No undo!** Make sure your Excel file is correct before importing
- **One exam type at a time!** Each import only affects the selected exam type
- **Clean slate every time!** Perfect for updating/fixing question sets

---

## 🎯 READY?

Deploy the backend:

```bash
npx supabase functions deploy server --no-verify-jwt
```

Then test your import! The old questions will be completely replaced with the new ones. 🚀
