# Getting Credentials - Step by Step Guide

## Part 1: Google Cloud Setup (15 minutes)

### Step 1.1: Create Google Cloud Project

1. Go to **https://console.cloud.google.com**
2. Click **Select a Project** (top left)
3. Click **NEW PROJECT**
4. Name: `DisasterCoordinator`
5. Click **CREATE**
6. Wait ~1 minute for project creation
7. Select the project when it appears

### Step 1.2: Enable Google Maps API

1. In Google Cloud Console, search for **Maps API**
2. Click **Maps API** result
3. Click **ENABLE**
4. Wait for it to enable (30 seconds)

### Step 1.3: Enable Gemini API

1. Search for **Generative AI API** in search bar
2. Click the result
3. Click **ENABLE**
4. Wait for it to enable

### Step 1.4: Create API Key

1. In Google Cloud Console, go to **Credentials** (left menu)
2. Click **+ CREATE CREDENTIALS**
3. Select **API Key**
4. A popup shows your API key
5. **Copy and save it** (you'll need it)
6. Click **CLOSE**

**You now have:** `GOOGLE_MAPS_API_KEY` and `GOOGLE_GEMINI_API_KEY` (same key works for both)

---

## Part 2: Firebase Setup (15 minutes)

### Step 2.1: Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **Create a project**
3. Name: `DisasterCoordinator`
4. Click **Continue**

### Step 2.2: Enable Realtime Database

1. In Firebase Console, click **Realtime Database** (left menu)
2. Click **Create Database**
3. **Location:** Choose closest to you
4. **Security Rules:** Select **Start in test mode**
5. Click **Enable**
6. Wait for database creation (~1 minute)

### Step 2.3: Copy Database URL

1. In **Realtime Database**, look for the URL at the top
2. It looks like: `https://yourdatabase-abc123.firebaseio.com`
3. **Copy and save this**

**You now have:** `FIREBASE_DATABASE_URL`

### Step 2.4: Get Project ID

1. In Firebase Console, click **Settings** (gear icon, top right)
2. Click **Project Settings**
3. Look for **Project ID** (e.g., `disastercoordinator-abc123`)
4. **Copy and save this**

**You now have:** `FIREBASE_PROJECT_ID`

### Step 2.5: Create Service Account Key

1. In **Project Settings**, click the **Service Accounts** tab
2. Click **Generate New Private Key**
3. A JSON file downloads automatically
4. **Don't move or delete this file yet**
5. Open it with a text editor
6. You'll need this entire content

---

## Part 3: Create .env Files

### Step 3.1: Backend .env file

1. Open file explorer
2. Navigate to: `C:\Users\Preethi\OneDrive\ドキュメント\Desktop\disasterproject\backend`
3. Create a new file: **Right-click → New → Text Document**
4. Name it: `.env` (note the dot at the start)
5. Open with text editor (Notepad)
6. Paste this content:

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_DATABASE_URL=https://your-database-url.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json

# Google APIs
GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_MAPS_API_KEY=your-maps-api-key-here

# Server
NODE_ENV=development
PORT=5000
```

### Step 3.2: Fill in Backend .env

Replace each placeholder:

| Placeholder | Get From | Example |
|------------|----------|---------|
| `your-project-id-here` | Firebase Project ID | `disastercoordinator-abc123` |
| `https://your-database-url...` | Firebase Database URL | `https://mydb-xyz.firebaseio.com` |
| `your-gemini-api-key-here` | Google Cloud API Key | `AIzaSyD...` |
| `your-maps-api-key-here` | Google Cloud API Key | `AIzaSyD...` |

**Save the file** (Ctrl+S)

### Step 3.3: Service Account Key File

1. Go to the downloaded service account JSON file
2. Copy the entire file
3. In `backend` folder, create a new folder called `config`
4. Paste the file there: `backend/config/service-account-key.json`
5. Update your `.env` file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY=./config/service-account-key.json
   ```

### Step 3.4: Frontend .env file

1. Open file explorer
2. Navigate to: `C:\Users\Preethi\OneDrive\ドキュメント\Desktop\disasterproject\frontend`
3. Create a new file: **Right-click → New → Text Document**
4. Name it: `.env`
5. Open with text editor
6. Paste:

```env
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key-here
```

7. Replace `your-maps-api-key-here` with your Google API key

**Save the file** (Ctrl+S)

---

## Quick Reference - Where to Get Each Value

```
FIREBASE_PROJECT_ID
├─ Go to: Firebase Console
├─ Click: Settings (gear) → Project Settings
└─ Copy: Project ID

FIREBASE_DATABASE_URL
├─ Go to: Firebase Console
├─ Click: Realtime Database
└─ Copy: URL from the top

FIREBASE_SERVICE_ACCOUNT_KEY
├─ Go to: Firebase Settings → Service Accounts
├─ Click: Generate New Private Key
└─ Save the downloaded JSON file

GOOGLE_GEMINI_API_KEY
├─ Go to: Google Cloud Console
├─ Click: Credentials
├─ Click: Create API Key
└─ Copy: The key shown

GOOGLE_MAPS_API_KEY
├─ Same as GOOGLE_GEMINI_API_KEY
└─ (Use the same key for both)
```

---

## Testing Your Setup

### Test 1: Backend Starts

```bash
cd backend
npm start
```

You should see:
```
✅ Server running on port 5000
✅ Firebase connected
```

### Test 2: Frontend Starts

Open a **new terminal/PowerShell**:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v4.x.x ready in xxx ms

➜ Local:   http://localhost:3000
```

### Test 3: Open App

Open browser: **http://localhost:3000**

You should see the login page.

---

## Troubleshooting

### Error: "Cannot find module"
```
Solution: Run: npm install
(in both backend and frontend folders)
```

### Error: "FIREBASE_PROJECT_ID not found"
```
Solution: Check your .env file exists in the backend folder
```

### Error: "Invalid API key"
```
Solution: Make sure your Google Cloud API key is correct
Check: https://console.cloud.google.com/credentials
```

### Error: "Connection refused"
```
Solution: Make sure backend is running on port 5000
Check: http://localhost:5000/api/health
Should return: {"status":"ok"}
```

---

## Next Steps

1. ✅ Create Google Cloud Project
2. ✅ Enable Maps & Gemini APIs
3. ✅ Get API Key
4. ✅ Create Firebase Project
5. ✅ Enable Realtime Database
6. ✅ Create Service Account
7. ✅ Create .env files
8. ✅ Test backend: `npm start`
9. ✅ Test frontend: `npm run dev`
10. ✅ Open http://localhost:3000

---

## FAQ

**Q: Do I need a credit card?**
A: Yes, for Google Cloud. Free tier gives you credits.

**Q: Can I use same API key for both?**
A: Yes! Use the same Google Cloud API key for both Maps and Gemini.

**Q: What if I lose my API key?**
A: You can create a new one anytime in Google Cloud Console.

**Q: Where does my data go?**
A: To Firebase Realtime Database (your Firebase project).

**Q: Can I test without real API keys?**
A: Partially - you can register users but AI features won't work.

---

## Done! 🎉

You now have all credentials needed. Next step:
→ Run backend: `cd backend && npm install && npm start`
→ Run frontend in new terminal: `cd frontend && npm install && npm run dev`
→ Open: http://localhost:3000

