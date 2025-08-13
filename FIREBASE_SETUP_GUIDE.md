# 🔥 Firebase Setup Guide for Donation App

## 📋 **Required Firebase Configuration**

### **1. Firebase Console Setup**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project**: `mealink-5b2c1`
3. **Enable required services**:
   - ✅ **Authentication** (already enabled)
   - ✅ **Firestore Database** (already enabled)
   - ✅ **Storage** (already enabled)

### **2. Firestore Security Rules**

**Go to Firestore Database → Rules and replace with:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all donations
    match /donations/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
    }
    
    // Allow users to read their own profile data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### **3. Storage Security Rules**

**Go to Storage → Rules and replace with:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload images to donations folder
    match /donations/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024 && // 5MB limit
        request.resource.contentType.matches('image/.*');
    }
    
    // Allow users to upload profile pictures
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

### **4. Enable Authentication Methods**

**Go to Authentication → Sign-in method and enable:**
- ✅ **Email/Password** (already enabled)
- ✅ **Google** (already enabled)

### **5. Create Firestore Indexes (if needed)**

**Go to Firestore Database → Indexes and create:**

```
Collection ID: donations
Fields to index:
- status (Ascending)
- createdAt (Descending)
```

### **6. Test Your Configuration**

After setting up the rules, test your donation form:

1. **Fill out the donation form**
2. **Upload an image**
3. **Submit the form**
4. **Check Firebase Console**:
   - **Storage**: Should see uploaded images in `donations/` folder
   - **Firestore**: Should see new documents in `donations` collection

### **7. Common Issues & Solutions**

#### **Issue: "Permission denied" error**
**Solution**: Check that your Firestore and Storage rules are properly set

#### **Issue: "Storage bucket not found"**
**Solution**: Verify your `storageBucket` in `src/firebase/config.ts` is correct

#### **Issue: "Image upload fails"**
**Solution**: 
- Check image size (should be < 5MB)
- Verify Storage rules allow image uploads
- Check browser console for errors

#### **Issue: "Firestore write fails"**
**Solution**:
- Verify user is authenticated
- Check Firestore rules allow writes
- Ensure all required fields are provided

### **8. Debug Steps**

1. **Open Browser Console** (F12)
2. **Try uploading a donation**
3. **Look for error messages**
4. **Check Network tab** for failed requests
5. **Verify Firebase connection** in console logs

### **9. Firebase Project Settings**

**Go to Project Settings → General and verify:**
- ✅ **Project ID**: `mealink-5b2c1`
- ✅ **Web app**: Properly configured
- ✅ **API Key**: Matches your config

### **10. Environment Variables (Optional)**

For production, consider using environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 **Quick Test**

After completing the setup:

1. **Refresh your app**
2. **Login with your account**
3. **Go to Donor Page**
4. **Fill out donation form**
5. **Upload an image**
6. **Submit the form**

**Expected Result**: 
- ✅ Image uploads to Firebase Storage
- ✅ Donation data saves to Firestore
- ✅ Success message appears
- ✅ Item appears on Receiver page

## 📞 **Need Help?**

If you're still having issues:
1. Check browser console for errors
2. Verify Firebase rules are published
3. Ensure you're logged in
4. Check image file size and format 