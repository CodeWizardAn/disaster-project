# 🚨 Hyperlocal Disaster Alert & Rescue Coordinator - Testing Guide

## System Overview

The application has been **fully enhanced** with new features and integrated view switching. Here's what's available:

### Completed Features ✅

1. **User Authentication**
   - Login/Register with email and password
   - Three user roles: Victim, Volunteer, Coordinator

2. **Victim Dashboard** (Report Emergencies)
   - Report disasters with location, type, description, injuries
   - Automatic geolocation with manual input fallback
   - View active requests on map
   - Mark own request as resolved

3. **Volunteer Dashboard** (Classic View)
   - See nearby disaster requests
   - Accept and complete assignments
   - View own assignments and status
   - Manual duty toggle

4. **Volunteer Assignments (NEW View)**
   - Enhanced duty toggle (Green = On Duty, Red = Off Duty)
   - Real-time nearby requests (updates every 10 seconds when on duty)
   - Accept assignment with one click
   - Complete assignments with notes
   - Location-based filtering (within 10km radius)

5. **Coordinator Dashboard**
   - View all active disaster requests
   - See volunteer assignments and status
   - Manual coordination controls

6. **Live Dashboard (NEW - Coordinator View)**
   - Real-time statistics dashboard
   - Filter by urgency level: Critical (🚨), High (⚠️), Medium (📋)
   - Interactive map showing all active requests
   - Auto-refreshes every 5 seconds
   - Clickable stat cards to filter requests

---

## Testing Instructions

### Prerequisites
- Node.js 18+ installed
- Two terminal windows open
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Start Backend Server

```powershell
# Terminal 1: Start the backend server
cd "c:\Users\Preethi\OneDrive\ドキュメント\Desktop\disasterproject\backend"
npm install  # If not already done
npm start
```

**Expected Output:**
```
✅ Firebase Admin SDK initialized (or)
ℹ️ Using in-memory mock database
Server running on port 5000
```

### Step 2: Start Frontend Dev Server

```powershell
# Terminal 2: Start the frontend server
cd "c:\Users\Preethi\OneDrive\ドキュメント\Desktop\disasterproject\frontend"
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### Step 3: Open Application in Browser

Navigate to: **http://localhost:3000**

You should see the **Login/Register** page with fields for:
- Email
- Password
- User Type Selector (Victim / Volunteer / Coordinator)

---

## Testing Scenarios

### Scenario 1: Report an Emergency (Victim Flow)

1. **Register as a Victim**
   - Email: `victim@example.com`
   - Password: `test123`
   - User Type: **Victim**
   - Click "Register"

2. **View Victim Dashboard**
   - You should see: "Report Emergency" button
   - Click the button

3. **Report a Disaster**
   - **Type of Disaster**: Select "Building Collapse"
   - **Description**: "Apartment building collapsed in downtown area"
   - **People Affected**: "15"
   - **Injury Severity**: "Critical"
   - **Accessibility**: "Limited access - roads blocked"
   - **Location**: 
     - Auto-captured if you allow geolocation
     - Or manually enter: Latitude: `20.5937`, Longitude: `78.9629`
   - Click **"Report Emergency"**

4. **Verify Submission**
   - Check browser console (F12 → Console tab) for debug logs
   - Request should appear on the map as a **red circle** (critical)
   - You should see a success message

### Scenario 2: Accept Assignments (Volunteer Flow - Classic)

1. **Register as a Volunteer**
   - Email: `volunteer@example.com`
   - Password: `test123`
   - User Type: **Volunteer**
   - Click "Register"

2. **View Volunteer Dashboard**
   - You should see nearby disaster requests
   - The map should show requests from Scenario 1 (red circles = critical)

3. **Accept an Assignment**
   - Click on a request card or the red circle on the map
   - Click **"Accept Assignment"** button
   - You should see status change to "Assigned"

4. **Complete the Assignment**
   - Click **"Complete"** button
   - Enter any notes (optional)
   - Assignment should move to "Completed" section

### Scenario 3: New Assignments View (Volunteer Flow - Enhanced)

1. **Same volunteer from Scenario 2**
   - In the header, click **"🎯 Assignments"** button
   - This switches to the NEW VolunteerAssignmentsNew view

2. **Toggle On Duty**
   - See **"Status: Off Duty"** at top with red button
   - Click the button to toggle to **"On Duty"** (green)
   - Your location should be captured automatically

3. **View Nearby Requests**
   - Once on duty, the system fetches nearby requests every 10 seconds
   - Requests within 10km radius are shown
   - Each shows: urgency score, type, description, people affected

4. **Accept & Complete**
   - Click **"Accept"** on a request card
   - Assignment becomes active
   - Click **"Mark Complete"** to finish
   - Add optional notes about what was done

### Scenario 4: Live Dashboard (Coordinator Flow)

1. **Register as a Coordinator**
   - Email: `coordinator@example.com`
   - Password: `test123`
   - User Type: **Coordinator**
   - Click "Register"

2. **View Coordinator Dashboard**
   - Default view shows coordinator controls
   - In the header, click **"📊 Live Stats"** button
   - This switches to the NEW LiveDashboard view

3. **View Real-Time Statistics**
   - You should see 4 stat cards:
     - 🚨 **Critical**: Count of critical requests
     - ⚠️ **High**: Count of high-priority requests  
     - 📋 **Medium**: Count of medium-priority requests
     - 📊 **Total**: Total active requests

4. **Filter by Priority**
   - Click **"🚨 Critical"** card to show only critical requests
   - Click **"⚠️ High"** to show high priority
   - Click **"📋 Medium"** to show medium
   - Click **"📊 All"** to show everything

5. **View on Map**
   - Scroll down to see the interactive map
   - Requests are shown as colored circles:
     - 🔴 Red = Critical
     - 🟠 Orange = High
     - 🟡 Yellow = Medium
   - Map auto-fits all visible requests

---

## Testing Checklist

- [ ] **Backend starts** without Firebase credentials (mock mode)
- [ ] **Frontend loads** on http://localhost:3000
- [ ] **Login page** displays correctly
- [ ] **Can register** as Victim, Volunteer, and Coordinator
- [ ] **Report Emergency** form appears for victims
- [ ] **Report Emergency** submission works (check console)
- [ ] **Disaster appears on map** as circle marker
- [ ] **Volunteer can accept** assignments
- [ ] **Volunteer can complete** assignments with notes
- [ ] **Volunteer Assignments view** shows duty toggle
- [ ] **Duty toggle** works (On/Off state changes)
- [ ] **Nearby requests** fetch when on duty
- [ ] **Live Dashboard** shows stat cards
- [ ] **Live Dashboard** filters work correctly
- [ ] **Map displays** with proper markers
- [ ] **All views** render without console errors

---

## API Endpoints (For Manual Testing)

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Create a Disaster (Manual)
```bash
curl -X POST http://localhost:5000/api/disasters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "Building Collapse",
    "description": "Test request",
    "latitude": 20.5937,
    "longitude": 78.9629,
    "peopleAffected": 10,
    "injurySeverity": "critical",
    "accessibility": "Limited"
  }'
```

### Fetch Open Requests
```bash
curl http://localhost:5000/api/disasters
```

---

## Troubleshooting

### Issue: "Module not found" errors
- **Solution**: Run `npm install` in both backend and frontend folders
- Check that all these files exist:
  - `frontend/src/components/LiveDashboard.jsx`
  - `frontend/src/components/VolunteerAssignmentsNew.jsx`
  - `backend/services/firebaseService.js`

### Issue: Backend not starting
- **Solution**: Check if port 5000 is in use
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 2>/dev/null
  ```
- Kill the process or use a different port

### Issue: Frontend not connecting to backend
- **Solution**: Check browser console (F12) for CORS errors
- Ensure backend is running on port 5000
- Try: `curl http://localhost:5000/api/health` in terminal

### Issue: Map not showing
- **Solution**: Check if Leaflet CSS is loaded (see `<link>` tags in `frontend/index.html`)
- Ensure `DisasterMap.jsx` component loads without errors

### Issue: Geolocation not working
- **Solution**: 
  - Allow location permission when prompted
  - Check browser console for geolocation errors
  - System will fallback to default center: (20.5937, 78.9629) if permission denied

### Issue: Report Emergency button disabled
- **Solution**: 
  - Form validation may require all fields filled
  - Location is no longer required (can be entered manually)
  - Check console for specific validation errors

---

## Console Debugging

Press **F12** in browser to open DevTools → **Console** tab

You should see logs like:
```
✅ Reporting disaster...
📍 Location captured: {lat: 20.5937, lng: 78.9629}
✅ Disaster reported successfully
🔄 Fetching nearby requests...
✅ Found 3 requests within 10km
```

---

## Next Steps

Once testing is complete, you can:

1. **Add more test data**
   - Create multiple disasters from different victims
   - Register multiple volunteers
   - Assign them to different requests

2. **Enhance features**
   - Add live location tracking for volunteers
   - Implement AI-powered request prioritization
   - Add push notifications
   - Create coordinator AI assistant

3. **Deploy to production**
   - Set up Firebase credentials
   - Configure environment variables
   - Deploy backend to Cloud Run or similar
   - Deploy frontend to Vercel or similar

---

## Key Files Modified

- ✅ `frontend/src/App.jsx` - Added view switchers for new components
- ✅ `frontend/src/components/LiveDashboard.jsx` - NEW real-time stats dashboard
- ✅ `frontend/src/components/VolunteerAssignmentsNew.jsx` - NEW enhanced volunteer view
- ✅ `backend/services/firebaseService.js` - Firebase + mock database support
- ✅ `backend/services/geminaiService.js` - Axios-based Gemini API calls

---

## Support

For issues, check:
1. Browser console (F12)
2. Backend terminal output
3. Network tab in DevTools
4. This testing guide

Happy testing! 🚀
