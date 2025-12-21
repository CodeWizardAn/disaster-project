# Demo & Testing Guide

## Quick Demo Walkthrough (15 minutes)

### Setup
```bash
# Terminal 1: Backend
cd backend
npm install
cp .env.example .env  # Add your API keys
npm start

# Terminal 2: Frontend
cd frontend
npm install
cp .env.example .env  # Add API key
npm run dev
```

Visit http://localhost:3000

---

## Demo Scenario: Earthquake Response

### Step 1: Register Users

**User 1 - Victim**
- Name: Sarah Johnson
- Email: sarah@example.com
- Type: Disaster Victim

**User 2 - Volunteer**
- Name: Mike Chen
- Email: mike@example.com
- Type: Volunteer (Expertise: Rescue, Medical)

**User 3 - Coordinator**
- Name: Lisa Rodriguez
- Email: lisa@example.com
- Type: Coordinator

### Step 2: Simulate Disaster

**Victim Reports:**
- Type: Earthquake
- Location: (40.7580, -73.9855) - Times Square, NYC
- Description: "Building shaking, multiple injuries"
- People Affected: 8
- Injury Level: Critical

**System Response:**
- ✅ Request created
- ✅ Nearby volunteers notified
- ✅ Coordinator dashboard updated

### Step 3: Volunteer Action

**Volunteer Dashboard:**
1. Volunteer sees new assignment
2. Clicks "Accept" to start rescue
3. Location automatically shared
4. Navigation to victim displays ETA

### Step 4: Coordination

**Coordinator Dashboard:**
- Views AI-aggregated requests
- Sees priority scores (1-10)
- Reviews recommended actions
- Dispatches optimal routes

### Step 5: Completion

- Victim rescued
- Volunteer marks assignment complete
- System records completion time
- Rating system engages

---

## Testing Checklist

### Unit Tests
```bash
cd backend
npm test
```

### API Integration Tests

**Test 1: User Registration**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "userType": "victim"
  }'
```

**Test 2: Report Disaster**
```bash
curl -X POST http://localhost:5000/api/disaster/mark-unsafe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "type": "building_collapse",
    "description": "Test emergency",
    "peopleAffected": 5,
    "injuryLevel": "severe"
  }'
```

**Test 3: Get Nearby Requests**
```bash
curl http://localhost:5000/api/disaster/nearby/40.7128/-74.0060?radius=10
```

**Test 4: AI Aggregation**
```bash
curl -X POST http://localhost:5000/api/ai/aggregate
```

**Test 5: Get Dashboard**
```bash
curl http://localhost:5000/api/ai/dashboard
```

### Load Testing

Using Apache Bench:
```bash
# Simulate 100 concurrent requests
ab -n 1000 -c 100 http://localhost:5000/api/health

# Test API endpoints
ab -n 500 -c 50 -p disaster.json \
  -T application/json \
  http://localhost:5000/api/disaster/mark-unsafe
```

### Frontend Testing

**Test User Flows:**
1. Register → Report Emergency → Receive Help
2. Register as Volunteer → Accept Assignment → Complete
3. View Coordinator Dashboard → See AI Aggregation → Dispatch

**Browser DevTools:**
- Check Network tab for API responses
- Monitor Console for errors
- Verify geolocation permissions

---

## Load Testing with Sample Data

### Generate Mock Data
```javascript
// backend/test-data.js
import { dbOperations } from './services/firebaseService.js';

async function generateTestData() {
  // Create 100 test requests
  for (let i = 0; i < 100; i++) {
    const lat = 40.7128 + (Math.random() - 0.5) * 0.1;
    const lng = -74.0060 + (Math.random() - 0.5) * 0.1;
    
    await dbOperations.createDisasterRequest({
      latitude: lat,
      longitude: lng,
      type: ['building_collapse', 'fire', 'flooding'][Math.floor(Math.random() * 3)],
      description: `Test emergency ${i}`,
      peopleAffected: Math.floor(Math.random() * 10) + 1,
      injuryLevel: ['critical', 'severe', 'moderate', 'minor'][Math.floor(Math.random() * 4)]
    });
  }
  console.log('Test data generated!');
}

generateTestData();
```

Run:
```bash
node test-data.js
```

---

## Performance Metrics

### Benchmark Results (Expected)

**API Response Times:**
- Health check: ~5ms
- User registration: ~50ms
- Report disaster: ~100ms
- Get nearby requests: ~80ms
- AI aggregation: ~400-500ms
- Route optimization: ~1-2 seconds

**Database Operations:**
- Single read: ~20ms
- Single write: ~40ms
- Batch operations: ~100-200ms
- Query with filtering: ~60ms

**Frontend:**
- Initial load: ~2-3 seconds
- Map rendering: ~1 second
- Marker updates: <100ms
- Dashboard refresh: <200ms

### Monitoring

```bash
# View Firebase metrics
firebase apps:list
firebase functions:list

# Check API logs
tail -f backend/logs/error.log
tail -f backend/logs/access.log
```

---

## Test Scenarios

### Scenario 1: High Volume Disaster
```json
{
  "numberOfRequests": 500,
  "affectedArea": "10 km radius",
  "criticalCases": 50,
  "timeWindow": "5 minutes",
  "expectedLoad": "100 requests/second"
}
```

**Test:** Can system handle 100+ requests/second?

### Scenario 2: Volunteer Saturation
```json
{
  "totalRequests": 200,
  "availableVolunteers": 50,
  "requestsPerVolunteer": 4,
  "dispatchTime": "under 30 seconds"
}
```

**Test:** Can all requests be assigned quickly?

### Scenario 3: Real-time Coordination
```json
{
  "activeAssignments": 100,
  "locationUpdates": 10,
  "updateFrequency": "every 5 seconds",
  "dashboardRefresh": "sub-second"
}
```

**Test:** Is dashboard responsive with 100 live assignments?

---

## Debugging Tips

### Enable Verbose Logging
```javascript
// backend/server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});
```

### Monitor Firebase
```bash
firebase database:profile \
  --output=json \
  --duration=60
```

### Check Network Issues
```bash
# Monitor API latency
curl -w "@curl-format.txt" \
  -o /dev/null -s \
  http://localhost:5000/api/health
```

### Browser Debugging
```javascript
// In browser console
localStorage.setItem('debug', '*');
// Reload page to see all logs
```

---

## Known Limitations & Future Improvements

### Current Limitations
1. No authentication/authorization
2. No database encryption
3. Single-server deployment
4. No data persistence between sessions
5. Simplified TSP algorithm (not true optimal)

### Future Improvements
1. **Authentication**
   - JWT tokens
   - OAuth 2.0 integration
   - Role-based access control

2. **Real-time Sync**
   - WebSocket for live updates
   - Operational Transform for conflict resolution
   - Offline-first architecture

3. **Advanced AI**
   - Multi-modal analysis (images, video)
   - Predictive resource allocation
   - Natural language processing

4. **Mobile App**
   - React Native or Flutter
   - Offline capabilities
   - Biometric authentication

5. **Scaling**
   - Kubernetes orchestration
   - Database sharding
   - Global CDN

6. **Advanced Analytics**
   - Response time tracking
   - Volunteer performance metrics
   - Disaster impact analysis

---

## Smoke Tests

Quick verification that everything works:

```bash
#!/bin/bash

# Test 1: API is running
echo "Testing API health..."
curl -f http://localhost:5000/api/health || exit 1

# Test 2: Can register user
echo "Testing user registration..."
curl -f -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","userType":"victim"}' || exit 1

# Test 3: Frontend is serving
echo "Testing frontend..."
curl -f http://localhost:3000 || exit 1

echo "✅ All smoke tests passed!"
```

---

## Feedback & Iteration

After testing:
1. ✅ Note what worked well
2. ⚠️ Document edge cases
3. 🔧 Fix bugs found
4. 📈 Optimize slow operations
5. 🚀 Deploy improvements
