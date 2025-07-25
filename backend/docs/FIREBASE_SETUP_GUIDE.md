# Firebase Complete Setup Guide

## Current Status
✅ Firebase Service Account Key ID: `your-private-key-id`  
⚠️ Missing: Complete private key for service account

## Step-by-Step Firebase Setup

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **collabbridge-2c528**

### 2. Generate Service Account Key
1. Click on **Project Settings** (⚙️ gear icon)
2. Go to **Service Accounts** tab
3. Click **Generate new private key**
4. Download the JSON file

### 3. Extract Required Information
The downloaded JSON file will contain:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40collabbridge-2c528.iam.gserviceaccount.com"
}
```

### 4. Update Environment Variables
Copy the values from the downloaded JSON and update your `.env` file:

```env
# Firebase Configuration
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the `\n` characters in the private key exactly as they appear
- Wrap the private key in double quotes
- The `client_email` will be different from the placeholder

### 5. Firebase Authentication Rules
Make sure your Firebase Authentication is configured:

1. Go to **Authentication** → **Sign-in method**
2. Enable the sign-in providers you want:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Other providers as needed

### 6. Firestore Database Rules (if using Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public portfolio data
    match /portfolios/{portfolioId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Authenticated write access
    }
  }
}
```

### 7. Test Firebase Connection
After updating the environment variables, restart your server and check the logs:

```bash
npm run dev
```

Look for:
✅ `✅ Firebase Admin initialized successfully`

Instead of:
⚠️ `⚠️ Firebase private key not configured. Firebase features will be disabled.`

## Security Best Practices

### 1. Environment Variables Security
- ✅ Never commit `.env` files to version control
- ✅ Use different service accounts for development/production
- ✅ Regularly rotate service account keys

### 2. Firebase Security Rules
- ✅ Implement proper Firestore security rules
- ✅ Use Firebase Auth for user authentication
- ✅ Validate tokens on the backend

### 3. Production Deployment
For production (Vercel/Render), add these environment variables:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your-private-key...\n-----END PRIVATE KEY-----\n"
```

## Current Backend Integration

Your backend is already configured to:
- ✅ Handle missing Firebase credentials gracefully
- ✅ Continue operation without Firebase if not configured
- ✅ Use Firebase for user authentication when available
- ✅ Verify Firebase ID tokens for protected routes

## After Setup Complete

Once Firebase is properly configured, your backend will support:
- 🔐 Firebase Authentication
- 👤 User account management
- 🔑 JWT token verification
- 📱 Mobile app authentication
- 🌐 Social login providers

## Troubleshooting

### Common Issues:
1. **Invalid private key format**: Ensure `\n` characters are preserved
2. **Wrong client email**: Use the email from the downloaded JSON
3. **Permissions error**: Make sure the service account has proper roles
4. **Network issues**: Check firewall settings for Firebase domains

### Testing Commands:
```bash
# Test server startup
npm run dev

# Test Firebase token verification (once configured)
curl -H "Authorization: Bearer FIREBASE_ID_TOKEN" \
     http://localhost:5001/api/users/profile
```

---

**Next Steps**: After completing Firebase setup, you'll have full authentication capabilities for your CollabBridge platform! 🚀
