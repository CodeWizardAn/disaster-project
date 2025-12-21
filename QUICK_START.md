# 🚀 Quick Start Guide

## What's Ready Now

Your application is **fully integrated** with:
- ✅ Volunteer "Assignments" view (duty toggle + nearby requests)
- ✅ Coordinator "Live Stats" view (real-time dashboard)
- ✅ View switchers in the header
- ✅ All components created and imported

---

## Start the Application (2 Commands)

### Terminal 1: Backend
```powershell
cd c:\Users\Preethi\OneDrive\ドキュメント\Desktop\disasterproject\backend
npm start
```

**Wait for this output:**
```
✅ Firebase Admin SDK initialized (or)
ℹ️ Using in-memory mock database
Server running on port 5000
```

### Terminal 2: Frontend
```powershell
cd c:\Users\Preethi\OneDrive\ドキュメント\Desktop\disasterproject\frontend
npm run dev
```

**Wait for this output:**
```
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:3000/
```

---

## Open in Browser

Go to: **http://localhost:3000**

---

## Test the 3 New Features

### 1️⃣ Report Emergency (Victim)
1. Register: `victim@test.com` / `test` / Victim
2. Click "Report Emergency"
3. Fill form and submit
4. See request appear on map (red circle)

### 2️⃣ Enhanced Volunteer View (NEW!)
1. Register: `volunteer@test.com` / `test` / Volunteer
2. Click **"🎯 Assignments"** button in header
3. Click green button to go **"On Duty"**
4. See nearby requests update every 10 seconds
5. Click "Accept" to take an assignment
6. Click "Mark Complete" to finish

### 3️⃣ Live Stats Dashboard (NEW!)
1. Register: `coordinator@test.com` / `test` / Coordinator  
2. Click **"📊 Live Stats"** button in header
3. See real-time statistics
4. Click stat cards to filter by priority
5. View interactive map with colored markers

---

## Key Button Locations

**In the header when logged in:**

For **Volunteer**:
- `📋 Classic View` - Old dashboard
- `🎯 Assignments` - NEW enhanced view ← **CLICK THIS**

For **Coordinator**:
- `👥 Coordinator` - Traditional view
- `📊 Live Stats` - NEW dashboard ← **CLICK THIS**

---

## Expected Behavior

✅ **Volunteer Assignments View:**
- Green "On Duty" button = enabled
- Red "Off Duty" button = duty disabled
- List of requests updates every 10 seconds
- Each request shows: type, description, people affected, urgency score
- "Accept" button adds assignment
- "Mark Complete" button finishes it

✅ **Live Stats Dashboard:**
- 4 cards showing: Critical, High, Medium, Total
- Clickable cards filter the request list
- Map shows colored circles: Red=Critical, Orange=High, Yellow=Medium
- Auto-refreshes every 5 seconds

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Kill the process: `Get-Process node \| Stop-Process` |
| "Cannot find module" | Run `npm install` in that folder |
| Map not showing | Reload browser (Ctrl+Shift+R) |
| Location not captured | Allow permission or use manual input |
| Buttons not appearing | Check browser console (F12) for errors |

---

## What to Check in Browser Console (F12)

Look for logs like:
```
✅ Reporting disaster...
🔄 Fetching nearby requests...
✅ Assignment accepted!
📍 Location: {lat: 20.5937, lng: 78.9629}
```

No red errors should appear.

---

## That's It!

You now have:
- 🎯 **3 user types** with different views
- 🗺️ **Real-time map** with markers
- 📊 **Live dashboard** with stats
- 🚨 **Emergency reporting**
- ✅ **Assignment workflow**
- 💚 **Duty management**

**Happy testing!** 🚀
