# Layer 1 Identity Registry - Firebase Deployment Guide

**Project**: Layer 1 Identity Registry  
**Firebase Project**: kk-maran  
**Hosting Site**: layer-1-identity-registry  
**Date**: June 23, 2026

---

## 🚀 Quick Deploy

### Option 1: Full Deploy (Recommended for first time)
```bash
cd layer-1-identity-registry
deploy.bat
```

### Option 2: Quick Deploy (Hosting only)
```bash
cd layer-1-identity-registry
quick-deploy.bat
```

### Option 3: Manual Deploy
```bash
cd layer-1-identity-registry
npm run build
firebase deploy --only hosting
```

---

## 📋 Pre-Deployment Checklist

### 1. Firebase CLI Setup
```bash
# Check if Firebase CLI is installed
firebase --version

# If not installed:
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 2. Verify Firebase Configuration
Check that `firebase-applet-config.json` has correct values:
- ✅ projectId: kk-maran
- ✅ firestoreDatabaseId: ai-studio-9527d949-1cd4-4c61-a332-f870d266a7ca

### 3. Build Test
```bash
npm run build
```
Should create `dist/` folder successfully.

### 4. Local Preview (Optional)
```bash
npm run preview
# or
firebase serve
```

---

## 🔧 Firebase Configuration

### firebase.json
```json
{
  "hosting": {
    "site": "layer-1-identity-registry",
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "kk-maran"
  }
}
```

---

## 🌐 Deployment URLs

### Primary URL:
```
https://layer-1-identity-registry.web.app
```

### Alternative URL:
```
https://layer-1-identity-registry.firebaseapp.com
```

### Firestore Database:
```
Database ID: ai-studio-9527d949-1cd4-4c61-a332-f870d266a7ca
Project: kk-maran
```

---

## 📦 What Gets Deployed

### Hosting:
- Built React app (from `dist/` folder)
- All static assets
- Service worker (if any)
- Single Page Application routing

### Firestore:
- Security rules (from `firestore.rules`)

### NOT Deployed:
- Source code (`src/`)
- Node modules
- Development files
- `.env` files

---

## 🔐 Firestore Rules

Current rules (OPEN - for development):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Production Warning**: Update these rules before going live!

Recommended production rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🛠️ Deployment Commands Reference

### Full Deployment:
```bash
firebase deploy
```

### Hosting Only:
```bash
firebase deploy --only hosting
```

### Firestore Rules Only:
```bash
firebase deploy --only firestore:rules
```

### Multiple Sites:
```bash
firebase deploy --only hosting:layer-1-identity-registry
```

---

## 🔍 Post-Deployment Verification

### 1. Check Hosting
```bash
# Open in browser
start https://layer-1-identity-registry.web.app

# Or check status
firebase hosting:channel:list
```

### 2. Test the App
- ✅ Login page loads
- ✅ Authentication works
- ✅ Dashboard accessible
- ✅ All routes working
- ✅ Firestore data loading

### 3. Check Firestore
```bash
firebase firestore:databases:list
```

### 4. Monitor Logs
```bash
firebase hosting:channel:deploy preview
```

---

## 🐛 Troubleshooting

### Issue: "Firebase command not found"
```bash
npm install -g firebase-tools
firebase login
```

### Issue: "Project not found"
```bash
firebase use kk-maran
```

### Issue: "Build folder not found"
```bash
npm run build
# Check that dist/ folder exists
```

### Issue: "Deployment failed"
```bash
# Check Firebase project access
firebase projects:list

# Re-authenticate
firebase login --reauth
```

### Issue: "Site not found"
```bash
# Create hosting site in Firebase Console
# Or use existing site name in firebase.json
```

---

## 📊 Deployment History

| Date | Version | Deployed By | Notes |
|------|---------|-------------|-------|
| 2026-06-23 | 1.0.0 | Initial | First production deploy |

---

## 🎯 Next Steps After Deployment

1. **Update DNS** (if custom domain)
2. **Configure Firestore Rules** (production security)
3. **Set up monitoring** (Firebase Analytics)
4. **Enable performance monitoring**
5. **Configure backup strategy**
6. **Set up CI/CD** (optional)

---

## 📞 Support

### Firebase Console:
https://console.firebase.google.com/project/kk-maran

### Documentation:
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firestore: https://firebase.google.com/docs/firestore
- CLI Reference: https://firebase.google.com/docs/cli

---

## ✅ Production Readiness

- ✅ Firebase configured
- ✅ Build process working
- ✅ Deployment scripts ready
- ✅ Firestore rules defined
- ⚠️ Security rules need hardening
- ⚠️ Custom domain setup (optional)
- ⚠️ Monitoring setup (recommended)

**Status**: Ready to deploy! 🚀
