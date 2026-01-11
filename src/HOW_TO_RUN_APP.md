# 🚀 How to Run Your App in the Browser

## ✅ You've Already Done the Hard Part!

✅ Backend deployed  
✅ Stripe configured  
✅ Tests passing  

Now let's see your app running!

---

## 🎯 Your App is Built in Figma Make

This is a **Figma Make** project, which means your app is likely:
- Already running in Figma Make's preview
- OR needs to be exported/deployed

---

## 📱 Option 1: View in Figma Make (Easiest)

**If you're working in Figma Make:**

1. Look for the **"Preview"** or **"Play"** button in Figma Make
2. Click it to see your app running
3. That's it! Your app should show up

---

## 🌐 Option 2: Deploy to the Web (Recommended)

To get a real URL anyone can visit:

### **Deploy to Vercel (Free & Fast):**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Login to Vercel (creates free account)
   - Confirm project settings
   - Wait for deployment (1-2 minutes)

4. **Get your URL:**
   - Vercel will give you a URL like: `https://your-app.vercel.app`
   - Open it in your browser!

---

## 💻 Option 3: Run Locally with Dev Server

If you want to run it on your computer:

### **Step 1: Check if you have Node.js**
```bash
node --version
```

If you see a version number, you're good! If not, install Node.js from: https://nodejs.org

### **Step 2: Install dependencies** (first time only)
```bash
npm install
```

### **Step 3: Start the dev server**

Try these commands (one at a time) to see which works:

```bash
npm start
```

OR

```bash
npm run dev
```

OR

```bash
npx vite
```

### **Step 4: Open in browser**

After running the command, you'll see something like:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
```

**Open the URL shown** (usually http://localhost:5173 or http://localhost:3000)

---

## 🎯 Which Option Should You Choose?

| Option | Best For | Time |
|--------|----------|------|
| **Option 1: Figma Make Preview** | Quick testing in Figma | Instant ⚡ |
| **Option 2: Deploy to Vercel** | Share with others, real URL | 2 minutes 🌐 |
| **Option 3: Local Dev Server** | Development & testing | 1 minute 💻 |

---

## 🐛 Troubleshooting

### "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org

### "Module not found" errors
**Fix:** Run `npm install` first

### Port already in use
**Fix:** 
- Close other dev servers
- Or the error will show an alternative port

### Can't find start script
**Fix:** Try these in order:
1. `npm run dev`
2. `npm start`
3. `npx vite`
4. Check README.md for project-specific instructions

---

## ✅ Success!

You'll know it's working when:
- ✅ Browser opens automatically
- ✅ You see your yacht exam training website
- ✅ You can click around and login
- ✅ Checkout redirects to Stripe

---

## 🎯 Quick Start (Copy These Commands)

```bash
# If running locally:
npm install
npm run dev

# Then open the URL shown (usually http://localhost:5173)
```

```bash
# If deploying to web:
npm install -g vercel
vercel

# Then open the URL Vercel gives you
```

---

## 📁 Deployment Files Already Created

I see you have these deployment scripts:
- `deploy-frontend.sh` - Script to deploy frontend
- `deploy-backend.sh` - Script to deploy backend (already done!)

**Try running:**
```bash
bash deploy-frontend.sh
```

This might automatically deploy your frontend for you!

---

## 🆘 Still Stuck?

Tell me:
1. **How are you building this?**
   - In Figma Make directly?
   - In VS Code or another editor?
   - From exported code?

2. **What do you want?**
   - Just test it yourself? → Option 3 (local)
   - Share with others? → Option 2 (Vercel)
   - Keep it in Figma? → Option 1 (preview)

---

**Start with Option 3 if you're on your computer!** 💻

Just run:
```bash
npm install
npm run dev
```

Then open the URL it shows you! 🚀
