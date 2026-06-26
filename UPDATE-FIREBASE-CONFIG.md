# 🔧 Update Firebase Configuration for Production

**Important**: Before deploying, you need to update the Firebase app configuration to match the production project `layer-1-masterservice`.

---

## ⚠️ ACTION REQUIRED

The current `firebase-applet-config.json` is configured for project `kk-maran`, but we're deploying to production project `layer-1-masterservice`.

### Current Config (kk-maran):
```json
{
  "projectId": "kk-maran",
  "appId": "1:645761948784:web:4ad9a8a281269b774d28b5",
  ...
}
```

### Need: Production Config (layer-1-masterservice)

---

## 📋 How to Get Production Firebase Config

### Option 1: From Firebase Console (Recommended)

1. **Go to Firebase Console**:
   ```
   https://console.firebase.google.com/project/layer-1-masterservice
   ```

2. **Navigate to Project Settings**:
   - Click the gear icon ⚙️ (top left)
   - Select "Project settings"

3. **Scroll to "Your apps" section**

4. **Select or Create Web App**:
   - If web app exists, click on it
   - If not, click "Add app" → Web (</>) icon
   - Name it: "Layer 1 Identity Registry"

5. **Copy Firebase Config**:
   You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "layer-1-masterservice.firebaseapp.com",
     projectId: "layer-1-masterservice",
     storageBucket: "layer-1-masterservice.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```

6. **Get Firestore Database ID**:
   - Go to Firestore Database in console
   - Look at the database dropdown
   - Copy the database ID (default is usually just blank)

### Option 2: From Old layer-1-firebase Code

Check if there's a config file in the old layer-1-firebase project:
```bash
# Look in these locations:
layer-1-firebase/hosting/admin/src/config/
layer-1-firebase/shared/
```

---

## 🔄 Update the Config File

Once you have the production config, update `firebase-applet-config.json`:

```json
{
  "projectId": "layer-1-masterservice",
  "appId": "[GET FROM FIREBASE CONSOLE]",
  "apiKey": "[GET FROM FIREBASE CONSOLE]",
  "authDomain": "layer-1-masterservice.firebaseapp.com",
  "firestoreDatabaseId": "[GET FROM FIRESTORE - might be default or custom]",
  "storageBucket": "layer-1-masterservice.appspot.com",
  "messagingSenderId": "[GET FROM FIREBASE CONSOLE]",
  "measurementId": ""
}
```

---

## ✅ After Updating Config

1. **Rebuild the app**:
   ```bash
   npm run build
   ```

2. **Test locally (optional)**:
   ```bash
   npm run dev
   ```
   - Try logging in
   - Verify data loads from production Firestore

3. **Deploy to production**:
   ```bash
   deploy.bat
   ```

---

## 🎯 Quick Checklist

Before deploying:
- [ ] Got Firebase config from console
- [ ] Updated `firebase-applet-config.json`
- [ ] Verified projectId is `layer-1-masterservice`
- [ ] Tested build: `npm run build`
- [ ] Ready to deploy: `deploy.bat`

---

## 🔍 Verification

After updating config, check these files:

### 1. firebase-applet-config.json
```bash
# Should show: "projectId": "layer-1-masterservice"
type firebase-applet-config.json
```

### 2. .firebaserc
```bash
# Should show: "default": "layer-1-masterservice"
type .firebaserc
```

### 3. firebase.json
```bash
# Should show: "site": "layer-1-masterservice-admin-panel"
type firebase.json
```

All three must match the production project!

---

## ⚠️ Important Notes

1. **Same Firestore Database**: Make sure the `firestoreDatabaseId` in the config matches the actual database in the production project.

2. **Authentication**: The production project should have Firebase Authentication enabled with Email/Password provider.

3. **Security Rules**: After deployment, the new Firestore rules (requiring authentication) will be applied.

4. **Existing Data**: All existing data in production Firestore will remain intact.

---

## 🆘 Need Help?

If you don't have access to the Firebase Console or can't find the config:
1. Ask the project owner for Firebase console access
2. Or get the `firebaseConfig` values from them
3. Or check if there's a `.env` file in the old layer-1-firebase project

Once you have the production config, we're ready to deploy! 🚀
