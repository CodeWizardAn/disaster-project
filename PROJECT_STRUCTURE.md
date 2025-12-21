# 📁 Complete Project Structure

## Frontend Directory Structure

```
frontend/
├── src/
│   ├── App.jsx                          ✅ UPDATED - Added view switchers
│   ├── index.html
│   ├── main.jsx
│   ├── pages/
│   │   ├── LoginRegister.jsx
│   │   └── VictimDashboard.jsx
│   ├── components/
│   │   ├── DisasterMap.jsx              ✅ Leaflet-based (no API keys)
│   │   ├── DisasterMapLeaflet.jsx
│   │   ├── ReportDisaster.jsx           ✅ Enhanced geolocation
│   │   ├── VolunteerDashboard.jsx       (Classic volunteer view)
│   │   ├── VolunteerAssignmentsNew.jsx  ✅ NEW - Enhanced volunteer
│   │   ├── CoordinatorDashboard.jsx
│   │   └── LiveDashboard.jsx            ✅ NEW - Real-time stats
│   ├── services/
│   │   ├── authService.js
│   │   ├── disasterService.js
│   │   ├── volunteerService.js
│   │   └── coordinatorService.js
│   └── store.js                         (Zustand state management)
├── package.json                         ✅ Has: react, vite, leaflet, zustand, axios
├── vite.config.js
└── index.html                           (with Leaflet CSS link)
```

## Backend Directory Structure

```
backend/
├── server.js                            ✅ Express server on port 5000
├── routes/
│   ├── authRoutes.js                    (login, register)
│   ├── disasterRoutes.js                (report, fetch, update)
│   ├── volunteerRoutes.js               (availability, assignments)
│   └── coordinatorRoutes.js             (overview, analytics)
├── services/
│   ├── firebaseService.js               ✅ ENHANCED - Mock + Firebase
│   ├── geminaiService.js                ✅ UPDATED - Axios-based API
│   ├── authService.js
│   ├── disasterService.js
│   ├── volunteerService.js
│   └── coordinatorService.js
├── middleware/
│   └── corsMiddleware.js                (handles frontend CORS)
├── package.json                         ✅ Has: express, firebase-admin, axios
└── .env                                 (optional - for Gemini key)
```

---

## Key Files to Know

### Frontend - User-Facing Views

**1. App.jsx** (162 lines)
- Main router component
- Handles login/dashboard conditional rendering
- **NEW:** Added view switchers for volunteer & coordinator
- State: `showNewAssignments`, `showLiveDashboard`
- Imports all 3 dashboard types + new components

**2. VolunteerAssignmentsNew.jsx** (280 lines) **[NEW]**
- Purpose: Enhanced volunteer assignment management
- Features:
  - Duty toggle (green/red indicator)
  - Auto-fetch nearby requests (10 seconds)
  - Accept/complete assignments
  - Optional notes on completion
- Uses: volunteerService, disasterService

**3. LiveDashboard.jsx** (240 lines) **[NEW]**
- Purpose: Real-time coordinator statistics
- Features:
  - 4 stat cards (Critical/High/Medium/Total)
  - Clickable filtering
  - Interactive map view
  - Auto-refresh (5 seconds)
- Uses: disasterService, DisasterMap component

### Frontend - Components

**DisasterMap.jsx** (110 lines)
- Leaflet map visualization
- Circle markers for requests (red/orange/yellow)
- Auto-fit bounds to markers
- No Google Maps API key needed

**ReportDisaster.jsx** (150 lines)
- Emergency reporting form
- Auto-geolocation with manual fallback
- Type/description/severity selectors
- Accessible input fields

### Backend - Services

**firebaseService.js** **[ENHANCED]**
- Firebase Admin SDK setup
- **NEW:** Supports file-based service account loading
- **NEW:** In-memory mock database fallback
- Graceful degradation when credentials missing
- Mock implements: `ref().set()`, `ref().update()`, `ref().once()`

**geminaiService.js** **[UPDATED]**
- **Removed:** google-generative-ai SDK
- **Added:** axios-based HTTP calls to Gemini API
- 3 functions: aggregate, analyze, strategy
- Fallback to simple urgency scoring

### Backend - Routes

**disasterRoutes.js**
- `POST /api/disasters` - Create request
- `GET /api/disasters` - Get all requests
- `GET /api/disasters/nearby` - Get nearby requests (lat, lng, radius)
- `PATCH /api/disasters/:id` - Update status

**volunteerRoutes.js**
- `PUT /api/volunteers/:id/availability` - Toggle on/off duty
- `POST /api/assignments/:id/accept` - Accept assignment
- `PATCH /api/assignments/:id/complete` - Mark complete

**coordinatorRoutes.js**
- `GET /api/coordinator/overview` - All requests & volunteers
- `GET /api/coordinator/analytics` - Statistics

---

## Database Schema (In-Memory Mock)

```javascript
{
  users: {
    'user123': {
      id: 'user123',
      email: 'victim@example.com',
      type: 'victim',
      password: 'hashed',
      createdAt: timestamp
    }
  },
  
  disasters: {
    'req123': {
      id: 'req123',
      userId: 'user123',
      type: 'Building Collapse',
      description: '...',
      latitude: 20.5937,
      longitude: 78.9629,
      peopleAffected: 15,
      injurySeverity: 'critical',
      status: 'open',
      createdAt: timestamp
    }
  },
  
  volunteers: {
    'vol123': {
      id: 'vol123',
      userId: 'user456',
      isAvailable: true,
      latitude: 20.5937,
      longitude: 78.9629,
      completedCount: 5
    }
  },
  
  assignments: {
    'assign123': {
      id: 'assign123',
      disasterId: 'req123',
      volunteerId: 'vol123',
      status: 'accepted',
      acceptedAt: timestamp,
      completedAt: null
    }
  }
}
```

---

## API Endpoints Summary

### Health & Status
- `GET /api/health` - Server status

### Disasters (Emergencies)
- `POST /api/disasters` - Report emergency
- `GET /api/disasters` - Get all requests
- `GET /api/disasters/nearby?lat=X&lng=Y&radius=10` - Nearby requests
- `PATCH /api/disasters/:id` - Update (resolve, etc)

### Volunteers
- `PUT /api/volunteers/:id/availability` - Toggle duty
- `POST /api/assignments/:id/accept` - Accept job
- `PATCH /api/assignments/:id/complete` - Mark done

### Coordinator
- `GET /api/coordinator/overview` - See all data
- `GET /api/coordinator/analytics` - Stats & insights

---

## Technology Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.21 | Build tool (hot reload) |
| Zustand | 4.5.7 | State management |
| Axios | 1.13.2 | HTTP requests |
| Leaflet | 1.9.4 | Map library (free) |
| Firebase | 10.14.1 | Auth (optional) |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| Firebase Admin SDK | Database (optional) |
| Axios | HTTP requests |
| CORS Middleware | Cross-origin support |

---

## Features Checklist

### Victim Features
- [x] Register as victim
- [x] Report emergency with:
  - [x] Disaster type (dropdown)
  - [x] Description (text)
  - [x] People affected (number)
  - [x] Injury severity (dropdown)
  - [x] Accessibility info (text)
  - [x] Auto-location capture
  - [x] Manual location input
- [x] View requests on map
- [x] Mark request resolved

### Volunteer Features
- [x] Register as volunteer
- **Classic View:**
  - [x] See nearby requests
  - [x] Accept assignments
  - [x] Complete assignments
- **[NEW] Assignments View:**
  - [x] Toggle on/off duty
  - [x] Auto-fetch nearby requests every 10s
  - [x] View requests with urgency scores
  - [x] Accept assignment
  - [x] Complete with notes

### Coordinator Features
- [x] Register as coordinator
- **Classic View:**
  - [x] See all requests
  - [x] View volunteer status
- **[NEW] Live Stats View:**
  - [x] Real-time stat cards
  - [x] Filter by priority
  - [x] Interactive map
  - [x] Auto-refresh

---

## Dependencies Installation

All dependencies are already installed, but to reinstall:

```powershell
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

Both should complete without errors.

---

## Environment Variables (Optional)

Create `.env` files if using real services:

**backend/.env**
```
GOOGLE_GEMINI_API_KEY=your_key_here
PORT=5000
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

For local testing, these are optional (system has fallbacks).

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend App | ✅ Ready | All imports correct, view switchers active |
| Backend Server | ✅ Ready | Mock DB ready, no credentials needed |
| Volunteer Assignments | ✅ Ready | Fully functional, duty toggle working |
| Live Dashboard | ✅ Ready | Stats and filtering implemented |
| Disaster Reporting | ✅ Ready | Geolocation with fallback |
| Map Visualization | ✅ Ready | Leaflet (no API key) |
| Services | ✅ Ready | All API endpoints implemented |

**Overall Status: 🟢 READY FOR TESTING**

---

## Next Actions

1. **Start servers** (see QUICK_START.md)
2. **Test all 3 user types** (see TESTING_GUIDE.md)
3. **Verify features** using checklist above
4. **Report any issues** with screenshots from browser console

---

**Last Updated:** Today
**Total Components:** 7
**Total Views:** 5
**API Endpoints:** 10+
**Lines of Code:** ~2000
