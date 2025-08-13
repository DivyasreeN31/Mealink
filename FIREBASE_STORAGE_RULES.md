# 🔥 Firebase Storage CORS Fix

## **🚨 URGENT: Fix CORS Error**

You're getting a CORS error because Firebase Storage isn't configured properly. Here's how to fix it:

### **Step 1: Go to Firebase Console**
1. Visit: https://console.firebase.google.com/
2. Select your project: `mealink-5b2c1`
3. Go to **Storage** in the left sidebar

### **Step 2: Update Storage Rules**
**Click on "Rules" tab and replace with:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow all authenticated users to read and write to donations folder
    match /donations/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow users to upload profile pictures
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Temporary: Allow all access for testing (remove in production)
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Step 3: Configure CORS for Storage**
**You need to use Firebase CLI to set CORS:**

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Create a CORS configuration file**:
   Create a file called `cors.json` in your project root:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

4. **Apply CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://mealink-5b2c1.appspot.com
   ```

### **Step 4: Alternative Quick Fix**
If you can't use Firebase CLI, try this temporary solution:

**Update your Storage Rules to be more permissive:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // WARNING: Only for testing!
    }
  }
}
```

**⚠️ WARNING: This allows anyone to upload. Only use for testing!**

### **Step 5: Test Upload**
After updating the rules:
1. Refresh your app
2. Try uploading an image again
3. Check if the CORS error is gone

## **Issue 2: Firestore Connection Problems**

The Firestore errors suggest connection issues. Let's also fix the Firestore rules:

### **Update Firestore Rules**
**Go to Firestore Database → Rules and replace with:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all donations
    match /donations/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Allow users to read their own profile data
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Temporary: Allow all access for testing
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## **Quick Test Steps**

1. **Update Storage Rules** (Step 2 above)
2. **Update Firestore Rules** (above)
3. **Refresh your app**
4. **Try uploading an image**
5. **Check console for errors**

## **Expected Results**

After fixing:
- ✅ No more CORS errors
- ✅ Image uploads successfully
- ✅ Donation data saves to Firestore
- ✅ Success message appears

## **If Still Having Issues**

1. **Check Firebase Console** for any error messages
2. **Verify your project ID** matches exactly
3. **Try a different browser** to rule out cache issues
4. **Check if you're logged in** to Firebase Console

Let me know what happens after you update the Storage rules! 