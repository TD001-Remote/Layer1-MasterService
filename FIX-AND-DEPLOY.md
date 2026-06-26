# 🔧 Fix Firebase Project & Deploy

## Problem
Firebase CLI was cached with wrong project: "public-website-network"  
Need to switch to: "layer-1-masterservice"

---

## ✅ Solution - Run This Now:

```bash
cd layer-1-identity-registry
fix-and-deploy.bat
```

This script will:
1. ✅ Set correct Firebase project (layer-1-masterservice)
2. ✅ Build the app
3. ✅ Deploy to production
4. ✅ Update Firestore rules

---

## Alternative: Step by Step

### Option 1: Fix Project First
```bash
cd layer-1-identity-registry
fix-project.bat
```
Then run: `deploy.bat`

### Option 2: Manual Commands
```bash
cd layer-1-identity-registry

# Step 1: List available projects
firebase projects:list

# Step 2: Set correct project
firebase use layer-1-masterservice

# Step 3: Verify
type .firebaserc

# Step 4: Build
npm run build

# Step 5: Deploy
firebase deploy --only hosting --project layer-1-masterservice
firebase deploy --only firestore:rules --project layer-1-masterservice
```

---

## Why This Happened

Firebase CLI caches the project selection. The log showed:
```
checking project public-website-network for permissions
```

But our .firebaserc has:
```json
{
  "projects": {
    "default": "layer-1-masterservice"
  }
}
```

The CLI cache overrides the file, so we need to explicitly run:
```bash
firebase use layer-1-masterservice
```

---

## ✅ Updated Scripts

All deployment scripts now include `--project layer-1-masterservice` flag:

- `fix-and-deploy.bat` - **Use this one!** (Fixes project + deploys)
- `deploy.bat` - Full deployment (now with --project flag)
- `quick-deploy.bat` - Quick deploy (now with --project flag)
- `fix-project.bat` - Just fix the project setting

---

## 🚀 Deploy Now

Run this command:
```bash
cd layer-1-identity-registry
fix-and-deploy.bat
```

This will fix the project configuration and deploy to production in one go! 🎯
