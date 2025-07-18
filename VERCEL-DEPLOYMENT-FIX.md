# 🚀 Vercel Deployment Fix

## The Issue
Vercel is trying to build from the root directory instead of the `frontend` directory, causing the build to fail because `astro` command is not found.

## ✅ Solution: Configure Vercel for Monorepo

### Option 1: Configure in Vercel Dashboard (Recommended)

1. **Go to your Vercel project settings**
2. **Navigate to "Settings" → "General"**
3. **Set the following build settings**:
   - **Framework Preset**: `Astro`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option 2: Deploy Frontend as Separate Project

1. **Create a new repository** for just the frontend
2. **Copy all files from `/frontend` directory** to the new repo
3. **Deploy the new repository** to Vercel
4. **Set environment variables** in the new project

## 🔧 Current Project Structure Issue

Your current structure:
```
CollabBridge/
├── backend/
├── frontend/    ← Astro project is here
│   ├── package.json
│   ├── astro.config.mjs
│   └── ...
└── (root files)
```

Vercel is trying to run `astro build` from the root directory where there's no `package.json` or `astro` command.

## 🚀 Quick Fix Commands

If you want to keep the monorepo structure, you need to tell Vercel exactly where your frontend is:

**In Vercel Dashboard:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 📝 Alternative: Move Frontend to Root

If you prefer, you could move all frontend files to the root level:

```bash
# Move frontend files to root (optional)
cd /Users/password/CollabBridge
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rmdir frontend
```

But the dashboard configuration is cleaner and maintains your project structure.
