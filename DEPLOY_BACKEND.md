# Backend Deployment Guide

## Deploy Supabase Edge Function

The backend server must be deployed to Supabase separately from the Vercel frontend.

### Method 1: Using Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project: **abtrsjhvjfgcxxpkszwi**
3. Click **Edge Functions** in the sidebar
4. Click **Deploy new function**
5. Name it: `server`
6. Copy and paste the entire contents of `/supabase/functions/server/index.tsx`
7. Click **Deploy**

### Method 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref abtrsjhvjfgcxxpkszwi

# Deploy the server function
supabase functions deploy server
```

### Method 3: Manual API Deployment

Use the Supabase Management API to deploy programmatically.

---

## Initialize Default Categories

After deploying the backend, run this script to populate default exam categories:

### Using Browser Console

1. Go to your deployed site: https://blackseabulgaria.com
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Copy and paste this code:

```javascript
const projectId = 'abtrsjhvjfgcxxpkszwi';
const publicAnonKey = 'YOUR_ANON_KEY'; // Get from Supabase dashboard

const defaultCategories = [
  {
    type: 'jet',
    title: 'Jet Ski License',
    titleBg: 'Лиценз за джет',
    description: 'Test your knowledge for operating personal watercraft',
    descriptionBg: 'Тест на знанията ви за управление на водни мотоциклети',
    icon: 'Waves',
    color: '#06b6d4',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
  {
    type: 'small',
    title: 'Small Boat License',
    titleBg: 'Лиценз за малка лодка',
    description: 'Basic boating skills and safety knowledge',
    descriptionBg: 'Основни умения за управление на лодка и знания за безопасност',
    icon: 'Sailboat',
    color: '#0ea5e9',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
  },
  {
    type: 'big',
    title: 'Big Boat License',
    titleBg: 'Лиценз за голяма лодка',
    description: 'Advanced boat handling and navigation',
    descriptionBg: 'Разширено управление на лодка и навигация',
    icon: 'Ship',
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  },
  {
    type: 'yacht',
    title: 'Yacht License (Up to 50 Tons)',
    titleBg: 'Лиценз за яхта (до 50 тона)',
    description: 'Professional yacht operation and maritime law',
    descriptionBg: 'Професионално управление на яхта и морско право',
    icon: 'Anchor',
    color: '#6366f1',
    image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800',
  },
  {
    type: 'navigation',
    title: 'Navigation Device Exam',
    titleBg: 'Изпит за навигационно устройство',
    description: 'Electronic navigation systems and equipment',
    descriptionBg: 'Електронни навигационни системи и оборудване',
    icon: 'Compass',
    color: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
];

// Get your access token from Supabase
async function initializeCategories() {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('Please log in first!');
    return;
  }

  for (const category of defaultCategories) {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/categories`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      }
    );

    if (response.ok) {
      console.log(`✅ Created category: ${category.title}`);
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create ${category.title}:`, error);
    }
  }

  console.log('🎉 All categories initialized!');
}

initializeCategories();
```

---

## Verify Deployment

1. Check health endpoint:
   ```
   https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health
   ```
   Should return: `{"status":"ok"}`

2. Check categories endpoint:
   ```
   https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/categories
   ```
   Should return: `{"categories":[...]}`

3. Home page should now show all 5 exam categories
4. Admin panel should now work (view users, manage categories)

---

## Troubleshooting

### Categories not showing
- Make sure backend is deployed to Supabase (not just Vercel)
- Check browser console for errors
- Verify categories endpoint returns data
- Frontend has fallback data, so it will always show something

### Admin panel "Need admin access" error
- Go to Admin Panel → API Keys tab
- Click "Grant Admin Access" button
- This sets your user metadata `isAdmin: true`

### Backend not responding
- Verify Edge Function is deployed in Supabase Dashboard
- Check Edge Function logs for errors
- Ensure environment variables are set correctly
