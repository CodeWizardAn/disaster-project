# Getting Gemini API Key - Step by Step

## The Easiest Way (5 minutes)

### Step 1: Go to Gemini API Page

Open this link in your browser:
**https://aistudio.google.com/app/apikey**

### Step 2: Click "Get API Key"

You should see a button that says:
- **"Get API Key"** or
- **"Create API Key"**

Click it.

### Step 3: Select or Create Project

A popup appears asking:
- **"Create a new Google Cloud project"** ← Select this
- Click **Create API Key in new project**

### Step 4: Copy Your Key

A new page shows your API key:
- It looks like: `AIzaSyD...` (long random string)
- Click the **copy button** next to it
- Your key is now copied

### Step 5: Save It Somewhere Safe

Open Notepad and paste:
```
GOOGLE_GEMINI_API_KEY=AIzaSyD...
```

Save this file on your desktop as a reminder.

---

## If That Doesn't Work - Alternative Method

### Step 1: Go to Google AI Studio

Open: **https://aistudio.google.com**

You should see a button that says:
- **"Get API Key"** (top right, or in menu)

Click it.

### Step 2: Create Project

If asked:
- Click **"Create a new Google Cloud project"**
- Or select an existing project

### Step 3: Generate API Key

Click **"Create API Key in new project"** or **"Create API Key"**

### Step 4: Copy the Key

Your API key appears on screen.
Click the copy icon.

---

## If You Already Have Google Cloud Project

### Step 1: Go to Google Cloud Console

Open: **https://console.cloud.google.com**

### Step 2: Select Your Project

Top left shows "Select a Project":
- Click it
- Choose your project (e.g., "DisasterCoordinator")

### Step 3: Enable Generative AI API

In search bar at top, type: **Generative AI**

Click the result: **"Generative AI API"**

### Step 4: Click ENABLE

Press the blue **ENABLE** button

Wait 30 seconds.

### Step 5: Go to Credentials

Left menu → Click **Credentials**

### Step 6: Create API Key

Click **+ CREATE CREDENTIALS**

Select **API Key**

Your key appears in a popup.

Click **copy** icon.

---

## Where to Use This Key

### In Backend (.env)
```env
GOOGLE_GEMINI_API_KEY=AIzaSyD...
```

### In Frontend (.env)
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...
```

(Use the SAME key for both)

---

## Verify It Works

Open PowerShell and test:

```bash
$apiKey = "AIzaSyD..." # Replace with your key

curl -X POST "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=$apiKey" `
  -ContentType "application/json" `
  -Body '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

If you get a response (not an error), your key works! ✅

---

## Common Issues

### Issue 1: "API not enabled"
**Solution:**
1. Go to https://console.cloud.google.com
2. Search for "Generative AI API"
3. Click ENABLE

### Issue 2: "Invalid API key"
**Solution:**
- Make sure you copied the entire key
- No extra spaces before or after
- The key should start with "AIzaSy"

### Issue 3: "Quota exceeded"
**Solution:**
- You're using too many requests
- Wait a few minutes
- Or upgrade your Google Cloud plan

### Issue 4: Key not appearing
**Solution:**
- Refresh the page (F5)
- Try the "AI Studio" method instead
- Clear your browser cache

---

## Quickest Method (Try This First)

1. Go to: **https://aistudio.google.com/app/apikey**
2. Click **"Get API Key"**
3. Click **"Create API Key in new project"**
4. Copy the key that appears
5. Done! ✅

---

## Still Need Help?

If you're stuck, tell me:
1. What error message do you see?
2. Which method did you try?
3. Did you create a Google account yet?

I'll help you fix it! 🚀
