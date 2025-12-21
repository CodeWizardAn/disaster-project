# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Health Check

### GET `/health`
Check if API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 3600
}
```

---

## User Management

### POST `/users/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "userType": "victim",
  "deviceToken": "firebase-device-token"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "uuid-here",
  "message": "User registered successfully"
}
```

### GET `/users/:userId`
Get user profile.

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "userType": "victim",
  "verified": false,
  "createdAt": 1234567890000
}
```

### PUT `/users/:userId`
Update user profile.

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "+9876543210"
}
```

### POST `/users/:userId/device-token`
Update device token for push notifications.

**Request:**
```json
{
  "deviceToken": "new-firebase-token"
}
```

---

## Disaster Management

### POST `/disaster/mark-unsafe`
Report being in disaster/need help.

**Request:**
```json
{
  "userId": "user-id",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "type": "building_collapse",
  "description": "Partial building collapse at location",
  "peopleAffected": 3,
  "injuryLevel": "severe",
  "accessibility": "difficult_terrain"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "request-id",
  "message": "Request created and volunteers notified"
}
```

**Types:** `unknown`, `building_collapse`, `fire`, `drowning`, `earthquake`, `landslide`, `flooding`

**Injury Levels:** `unknown`, `critical`, `severe`, `moderate`, `minor`, `none`

### POST `/disaster/mark-safe`
Mark user as safe.

**Request:**
```json
{
  "userId": "user-id"
}
```

### GET `/disaster/nearby/:lat/:lng`
Get nearby disaster requests.

**Query Params:**
- `radius` (default: 5) - Search radius in km

**Response:**
```json
{
  "count": 3,
  "radius": 5,
  "requests": [
    {
      "id": "req-1",
      "type": "building_collapse",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "peopleAffected": 3,
      "status": "open"
    }
  ]
}
```

### GET `/disaster/all/open`
Get all open disaster requests.

### PUT `/disaster/:requestId`
Update disaster request.

**Request:**
```json
{
  "status": "in_progress",
  "assignedVolunteerId": "vol-id"
}
```

### GET `/disaster/:requestId/details`
Get detailed request info with nearby facilities.

---

## Volunteer Management

### POST `/volunteers/register`
Register as a volunteer.

**Request:**
```json
{
  "userId": "user-id",
  "name": "Jane Smith",
  "expertise": ["rescue", "medical"],
  "skills": ["first_aid", "swimming"],
  "maxDistance": 10
}
```

### POST `/volunteers/:volunteerId/location`
Update volunteer location (real-time).

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### GET `/volunteers/:volunteerId/assignments`
Get volunteer's assignments.

**Response:**
```json
{
  "volunteerId": "vol-id",
  "activeAssignments": [...],
  "completedAssignments": [...],
  "total": 5
}
```

### POST `/volunteers/:volunteerId/accept/:assignmentId`
Accept an assignment.

### POST `/volunteers/:volunteerId/complete/:assignmentId`
Complete an assignment.

**Request:**
```json
{
  "notes": "Victim safely evacuated",
  "victimSafetyStatus": "safe"
}
```

### PUT `/volunteers/:volunteerId/availability`
Update volunteer availability.

**Request:**
```json
{
  "available": true
}
```

### GET `/volunteers/nearby/:lat/:lng`
Get available volunteers nearby.

**Query Params:**
- `radius` (default: 10) - Search radius in km

---

## AI & Coordination

### POST `/ai/aggregate`
Aggregate and prioritize all open requests using Gemini AI.

**Response:**
```json
{
  "success": true,
  "totalRequests": 10,
  "aggregated": [
    {
      "requestIds": [0, 1, 2],
      "priority": "CRITICAL",
      "urgencyScore": 9,
      "combinedDescription": "Multiple building collapses...",
      "requiredResources": ["rescue_team", "medical_team"],
      "estimatedVictimsCount": 15,
      "recommendedAction": "Deploy all available rescue teams"
    }
  ],
  "summary": "AI analysis of disaster situation"
}
```

**Priority Levels:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`

### POST `/ai/analyze/:requestId`
Analyze a specific request with context.

**Response:**
```json
{
  "success": true,
  "requestId": "req-id",
  "analysis": {
    "immediateActions": [...],
    "teamComposition": [...],
    "safetyConsiderations": [...]
  },
  "nearbyRequestsCount": 3
}
```

### POST `/ai/strategy`
Generate rescue strategy for a cluster.

**Request:**
```json
{
  "requestIds": ["req-1", "req-2"],
  "availableVolunteerIds": ["vol-1", "vol-2"]
}
```

**Response:**
```json
{
  "success": true,
  "strategy": {
    "resourceAllocation": {...},
    "sequence": [...],
    "timeline": {...}
  },
  "cluster": {...}
}
```

### POST `/ai/match`
Smart matching between volunteer and request.

**Request:**
```json
{
  "requestId": "req-id",
  "volunteerId": "vol-id"
}
```

**Response:**
```json
{
  "success": true,
  "assignmentId": "assign-id",
  "eta": {
    "distanceKm": 2.5,
    "durationMinutes": 12,
    "estimatedArrival": "2024-01-01T12:15:00Z"
  }
}
```

### POST `/ai/route-optimize`
Get optimized rescue route.

**Request:**
```json
{
  "origin": {"lat": 40.7128, "lng": -74.0060},
  "destinationIds": ["req-1", "req-2", "req-3"]
}
```

**Response:**
```json
{
  "success": true,
  "route": [...],
  "totalDistance": 15.3,
  "totalDuration": 45,
  "waypoints": [...]
}
```

### GET `/ai/dashboard`
Get real-time coordination dashboard.

**Response:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "totalRequests": 20,
  "criticalCount": 3,
  "highCount": 7,
  "aggregated": [...],
  "summary": "..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Description of the error"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

- No rate limiting in demo version
- Recommended for production: 100 req/min per IP

## Authentication

Current version uses user ID in request body. For production:
- Add JWT token authentication
- Implement OAuth 2.0
- Add role-based access control (RBAC)

## WebSocket Support (Future)

For real-time updates without polling:
```javascript
const ws = new WebSocket('ws://localhost:5000/socket');
ws.on('request-created', (data) => {...});
ws.on('volunteer-nearby', (data) => {...});
```
