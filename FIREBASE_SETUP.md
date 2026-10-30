# SobTools — Production Firebase Authentication & Mandatory Login System Setup Guide

This comprehensive guide details the setup, security rules, environment configuration, and administration for **SobTools** (`All Your Tools in One Place`).

---

## Architecture Overview
- **Authentication**: Firebase Authentication (Email/Password registration & login, Google Sign-In with popup, Password Reset flow, and strict Email Verification enforcement).
- **Mandatory Login System**: Route and component-level protection preventing unauthenticated access to all 39 digital utilities. Unauthenticated attempts are redirected to `/login`, preserving the requested URL.
- **Database**: Firebase Cloud Firestore with zero-trust Attribute-Based Access Control (ABAC) security rules.
- **User Dashboard**: Multi-tab management hub for profile customization, avatar selection, favorite tools, chronologically logged tool usage, language & theme preferences, password updates, and secure account deletion.
- **Admin Hub**: Restricted dashboard (`/admin`) with real-time user management, account suspension/reactivation, announcement broadcasting, and global website settings.

---

## Step-by-Step Production Setup

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter a name (e.g. `SobTools-Production`).
3. (Optional) Enable Google Analytics for search traffic tracking, then click **Create project**.

### Step 2: Register the SobTools Web Application
1. In Project Overview, click the **Web** icon (`</>`) to add an app.
2. App nickname: `SobTools Web App`.
3. Check **Also set up Firebase Hosting for this app** if planning to deploy via Firebase Hosting.
4. Click **Register app**.

### Step 3: Obtain Firebase Web Configuration
Copy the configuration object provided:
```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```
Store these values in `firebase-applet-config.json` or your `.env` variables.

### Step 4: Enable Email/Password Authentication
1. In the Firebase console left sidebar, navigate to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, choose **Email/Password**.
4. Enable the first toggle: **Email/Password**. Leave Email link (passwordless) disabled.
5. Click **Save**.

### Step 5: Enable Google Authentication
1. Under **Sign-in method**, click **Add new provider** and select **Google**.
2. Toggle **Enable**.
3. Set your project public-facing support email (e.g. `mdmorshedalamhridayy@gmail.com`).
4. Click **Save**.

### Step 6: Configure Authorized Domains
1. In **Authentication** > **Settings** > **Authorized domains**, add:
   - `localhost`
   - Your Cloud Run or custom domain: e.g. `sobtools.com`
   - Your development preview URLs

### Step 7: Set up Cloud Firestore Database
1. In the Firebase console, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., `asia-southeast1` for Bangladesh & regional performance).
4. Select **Start in production mode** (our hardened rules will secure it).
5. Click **Create**.

### Step 8: Deploy Firestore Security Rules
1. In Firestore, click the **Rules** tab.
2. Paste the contents of `firestore.rules` from this repository.
3. Click **Publish** (or use the Firebase CLI / AI Studio DeployRules RPC).

### Step 9: Configure Email Verification & Password Reset Templates
1. Go to **Authentication** > **Templates**.
2. **Email address verification**:
   - Sender name: `SobTools Support`
   - Reply-to: `support@sobtools.com`
   - Subject: `Verify your email for SobTools`
3. **Password reset**:
   - Customize with clear instructions and 1-hour expiry time.

### Step 10: Configure Server-Side Admin Authorization
The administrative account is bootstrapped using your verified administrator email:
`mdmorshedalamhridayy@gmail.com`.
Upon logging in and verifying your email, the system automatically registers the admin record in the secure `/admins/{uid}` collection. Normal users cannot escalate privileges or set themselves to admin in Firestore.

### Step 11: Configure Environment Variables
Create a `.env` file in the project root:
```bash
# General App Configuration
APP_URL="https://your-domain.com"
GEMINI_API_KEY=""

# Firebase Web Configuration (for custom/external deployments)
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_DATABASE_ID="(default)"
```

### Step 12: Test Authentication Locally
1. Run `npm run dev` to start dev server on `http://localhost:3000`.
2. Visit `/tools/image-compressor` as a guest:
   - Confirm automatic redirect to `/login` with notification: *"Authentication Required"*.
3. Test Google Sign-In or Email/Password registration.
4. Verify email verification screen (`/verify-email`) displays cooldown timer and reload check.
5. Visit `/dashboard` to verify favorites, usage history, and profile updates.
6. Visit `/admin` with the admin account to confirm user management, suspension controls, and site settings.

### Step 13: Configure Production Domains & Deploy
Build the project for production:
```bash
npm run build
```
Deploy the `dist/` folder using Firebase Hosting, Vercel, Cloud Run, or your preferred hosting platform.

---

## Security Invariants Checklist
- [x] Zero client-side privilege escalation (`role: admin` rejected by Firestore rules).
- [x] Passwords are never stored in plaintext; handled by Google's secure OAuth & bcrypt credential infrastructure.
- [x] Unverified users cannot bypass tool authorization or modify database records.
- [x] Suspended accounts are immediately blocked from tools with a contact resolution screen.
- [x] Sensitive user files are processed 100% locally in the browser sandbox; no file payloads sent to Firestore.
