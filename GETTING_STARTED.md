# Getting Started Guide

## Quick Start (5 minutes)

### 1. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file with your API keys:
```env
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_GEMINI_API_KEY=your-gemini-key
GOOGLE_MAPS_API_KEY=your-maps-key
NODE_ENV=development
PORT=5000
```

Run backend:
```bash
npm start
# Backend runs on http://localhost:5000
```

### 2. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

Run frontend:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

## API Keys Setup

### 1. Google Cloud Console
- Create a new project
- Enable: Maps API, Gemini API
- Create API key
- Enable billing

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Realtime Database
4. Create service account key
5. Copy credentials to `.env`

### 3. Testing Endpoints

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "victim"
  }'
```

#### Report Emergency
```bash
curl -X POST http://localhost:5000/api/disaster/mark-unsafe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "type": "building_collapse",
    "description": "Building partially collapsed",
    "peopleAffected": 5,
    "injuryLevel": "critical"
  }'
```

#### Get AI Aggregation
```bash
curl -X POST http://localhost:5000/api/ai/aggregate
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Victim  │  │Volunteer │  │   Coordinator        │  │
│  │Dashboard │  │Dashboard │  │   Dashboard (AI)     │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│                                                         │
│              Google Maps Integration                    │
└────────────────────────┬────────────────────────────────┘
                         │
                    Express.js API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐      ┌───▼────┐      ┌───▼────┐
    │Firebase │      │Gemini  │      │Google  │
    │Realtime │      │API     │      │Maps API│
    │Database │      │(AI)    │      │        │
    └────────┘      └────────┘      └────────┘
        │
        │ Real-time events
    ┌───▼────────────┐
    │FCM Push Notif  │
    │  (Users)       │
    └────────────────┘
```

## Key Features

### For Victims
- ✅ Mark themselves as safe/unsafe
- ✅ Report specific disaster type and impact
- ✅ Receive volunteer assignments
- ✅ Real-time tracking of rescue teams
- ✅ Push notifications with ETA

### For Volunteers
- ✅ Register with skills/expertise
- ✅ Real-time location sharing
- ✅ Accept/decline assignments
- ✅ Navigation to victims
- ✅ Mark assignments as complete

### For Coordinators
- ✅ AI-powered request aggregation
- ✅ Real-time dashboard with priorities
- ✅ Volunteer-victim matching
- ✅ Route optimization
- ✅ Strategy generation for clusters

### AI Features (Gemini)
- Automatic request prioritization (1-10 scale)
- Context analysis for nearby requests
- Resource requirement suggestions
- Rescue strategy generation
- Cluster-based optimization

### Routing Features (Google Maps)
- TSP (Traveling Salesman Problem) optimization
- Real-time ETA calculations
- Traffic-aware routing
- Nearby facility discovery (hospitals, police)
- Multi-destination clustering

## Database Schema (Firebase Realtime)

```
disasterproject-db/
├── users/
│   └── {userId}/
│       ├── name
│       ├── email
│       ├── userType
│       ├── location
│       ├── deviceToken
│       └── createdAt
│
├── volunteers/
│   └── {volunteerId}/
│       ├── name
│       ├── expertise[]
│       ├── currentLocation
│       ├── available
│       ├── rating
│       └── createdAt
│
├── disasterRequests/
│   └── {requestId}/
│       ├── userId
│       ├── latitude
│       ├── longitude
│       ├── type
│       ├── description
│       ├── peopleAffected
│       ├── injuryLevel
│       ├── status
│       └── createdAt
│
└── assignments/
    └── {assignmentId}/
        ├── volunteerId
        ├── requestId
        ├── status
        ├── estimatedArrivalMinutes
        └── createdAt
```

## Performance Targets

- Real-time updates: <1 second
- Disaster report processing: <100ms
- AI aggregation: <500ms for 1000 requests
- Route optimization: <2 seconds
- FCM notification delivery: >99%

## Troubleshooting

### Firebase connection issues
- Check service account JSON format
- Verify DATABASE_URL includes `.firebaseio.com`
- Ensure Firebase rules allow read/write

### API not starting
- Check if port 5000 is already in use
- Verify all environment variables are set
- Check Node.js version (16+ required)

### Frontend not loading
- Clear browser cache
- Check if backend API is accessible
- Verify VITE_API_BASE in .env

### Push notifications not working
- Ensure deviceToken is properly saved
- Check FCM is enabled in Firebase
- Verify service account has messaging permissions

## Next Steps

1. **Deploy to Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase init hosting
   firebase deploy
   ```

2. **Add Database Backups**
   - Enable Firebase automated backups
   - Set up Cloud Storage buckets

3. **Monitor & Analytics**
   - Enable Firebase Analytics
   - Set up error logging
   - Monitor API performance

4. **Scale the System**
   - Use Cloud Functions for heavy computation
   - Add caching layer (Redis)
   - Implement database sharding

## Demo Workflow

1. **Register as Victim**
   - Enter name, email
   - Allow location access
   - Report emergency

2. **Register as Volunteer**
   - Enter skills/expertise
   - Enable location sharing
   - Go online

3. **Coordinator View**
   - See aggregated requests
   - View AI priorities
   - Dispatch volunteers

## Support

For issues or questions:
- Check API logs: `tail -f backend/logs/`
- Review Firebase console: https://console.firebase.google.com
- Test endpoints using provided curl examples
