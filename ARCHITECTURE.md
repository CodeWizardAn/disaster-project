# System Architecture & Design

## Overview

The Hyperlocal Disaster Alert & Rescue Coordinator is a real-time emergency response platform that leverages AI, cloud infrastructure, and geolocation technology to coordinate rescue efforts during disasters.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│  Web App (React)       │  Mobile (Future)    │  Admin Dashboard    │
│  - Victim Dashboard    │  - Native iOS/      │  - Coordinator      │
│  - Volunteer Dashboard │    Android          │    Tools            │
│  - Coordinator View    │  - Offline-first    │  - Analytics        │
└──────────┬──────────────────────┬──────────────────────┬────────────┘
           │                      │                      │
           └──────────────────────┴──────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  Express.js REST API                                                 │
│  - Request validation & sanitization                                │
│  - Rate limiting & throttling                                       │
│  - CORS & security headers                                          │
│  - Request/response logging                                         │
└──────────┬────────────────────────────────────────────────┬─────────┘
           │                                                │
    ┌──────▼─────────┐  ┌──────────────────┐  ┌──────────▼────┐
    │  User Service  │  │ Disaster Service │  │ AI Service    │
    │  - Auth        │  │ - Requests       │  │ - Aggregation │
    │  - Profile     │  │ - Status Updates │  │ - Analysis    │
    │  - Devices     │  │ - Locations      │  │ - Strategy    │
    └──────┬─────────┘  └────────┬─────────┘  └──────────┬────┘
           │                     │                       │
           │         ┌───────────┼───────────┐           │
           │         │           │           │           │
    ┌──────▼─────────▼───┐  ┌───▼──────────▼┐  ┌──────▼────────┐
    │  Volunteer Service │  │ Routing Service │ │ Matching Svc  │
    │  - Registration    │  │ - Optimization  │ │ - Volunteer  │
    │  - Assignments     │  │ - ETA Calc      │ │ - Request    │
    │  - Location Track  │  │ - Maps API      │ │ - Scoring    │
    └────────┬───────────┘  └────────┬────────┘  └──────┬───────┘
             │                       │                  │
             └───────────────────────┼──────────────────┘
                                     │
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐   │
│  │  Firebase Realtime DB      │  │  Firebase Cloud Storage      │   │
│  │  (Real-time syncing)       │  │  (Media & backups)           │   │
│  │  - Users & Devices         │  │                              │   │
│  │  - Disaster Requests       │  │  Cache Layer (Redis)         │   │
│  │  - Volunteers & Locations  │  │  - Recent requests           │   │
│  │  - Assignments             │  │  - User sessions             │   │
│  │  - Status Updates          │  │  - Volunteer list            │   │
│  └────────────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                     │
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌────────────────┐  ┌──────────────────┐    │
│  │ Google Gemini    │  │ Google Maps    │  │ Firebase Cloud   │    │
│  │ API              │  │ API            │  │ Messaging (FCM)  │    │
│  │ - AI Analysis    │  │ - Geocoding    │  │ - Push Notif     │    │
│  │ - Aggregation    │  │ - Directions   │  │ - Device Tokens  │    │
│  │ - Prioritization │  │ - TSP Solving  │  │ - Multicast      │    │
│  │ - Strategy Gen   │  │ - Facility      │  │   Messaging      │    │
│  │                  │  │   Search       │  │                  │    │
│  └──────────────────┘  └────────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Frontend Application (React)
**Purpose:** User-facing interfaces for different user types

**Components:**
- `LoginRegister` - Authentication
- `VictimDashboard` - Report emergencies, view help status
- `VolunteerDashboard` - Accept assignments, track locations
- `CoordinatorDashboard` - AI dashboard, resource allocation
- `DisasterMap` - Google Maps integration

**State Management:** Zustand stores
- `useAuthStore` - Current user context
- `useDisasterStore` - Emergency requests
- `useVolunteerStore` - Volunteer assignments
- `useMapStore` - Map center and markers

### 2. Backend API (Node.js/Express)
**Purpose:** Core business logic and service orchestration

**Routes:**
- `/api/users` - User management
- `/api/disaster` - Disaster reporting & tracking
- `/api/volunteers` - Volunteer operations
- `/api/ai` - AI-powered coordination

**Controllers:**
- Handle HTTP requests/responses
- Validate input data
- Orchestrate services
- Error handling

**Services:**
- `firebaseService` - Database operations
- `geminaiService` - AI aggregation & analysis
- `routingService` - Route optimization & ETA
- `notificationService` - Push notifications

### 3. Database (Firebase Realtime)
**Structure:**
```
├── users/{userId}
│   ├── name, email, phone
│   ├── userType, verified
│   ├── deviceToken
│   └── timestamps
│
├── volunteers/{volunteerId}
│   ├── expertise[], skills[]
│   ├── currentLocation
│   ├── available, rating
│   └── assignments
│
├── disasterRequests/{requestId}
│   ├── userId, latitude, longitude
│   ├── type, description
│   ├── peopleAffected, injuryLevel
│   ├── status, assignedVolunteerId
│   └── timestamps
│
└── assignments/{assignmentId}
    ├── volunteerId, requestId
    ├── status, estimatedArrival
    └── timestamps
```

### 4. AI Services (Google Gemini)
**Capabilities:**

1. **Request Aggregation**
   - Analyzes multiple disaster requests
   - Groups nearby requests
   - Assigns priority scores (1-10)
   - Suggests resource requirements

2. **Context Analysis**
   - Evaluates request details
   - Considers surrounding requests
   - Suggests immediate actions
   - Identifies safety concerns

3. **Strategy Generation**
   - Creates rescue operation plans
   - Allocates resources
   - Sequences operations
   - Estimates timelines

### 5. Routing Engine (Google Maps)
**Features:**

1. **Distance Matrix API**
   - Calculates distances between points
   - Gets travel times
   - Considers traffic conditions

2. **Traveling Salesman Problem (TSP)**
   - Implements nearest neighbor heuristic
   - Clusters large destination sets
   - Optimizes rescue routes

3. **ETA Calculation**
   - Real-time travel time
   - Traffic-aware routing
   - Destination sequencing

4. **Facility Discovery**
   - Finds nearby hospitals
   - Locates police stations
   - Identifies shelter locations

### 6. Push Notification System (FCM)
**Capabilities:**

1. **Unicast**
   - Send to individual users
   - Device token based
   - Includes data payload

2. **Multicast**
   - Broadcast to volunteer groups
   - Location-based targeting
   - Campaign notifications

3. **Data Payload**
   - Assignment details
   - Request information
   - Route instructions

## Data Flow

### Emergency Reporting Flow
```
User Reports Emergency
    ↓
Validate Location & Details
    ↓
Create DisasterRequest in DB
    ↓
Find Nearby Volunteers (5km radius)
    ↓
Send FCM Notifications
    ↓
AI Aggregation (background)
    ↓
Update Coordinator Dashboard
```

### Volunteer Assignment Flow
```
Coordinator Dispatches Volunteer
    ↓
Match Algorithm (scoring)
    ↓
Create Assignment
    ↓
Send FCM with Details
    ↓
Volunteer Accepts/Rejects
    ↓
Calculate Route
    ↓
Provide Navigation
    ↓
Volunteer Completes
    ↓
Update Status & Ratings
```

### AI Coordination Flow
```
Get All Open Requests
    ↓
Send to Gemini API
    ↓
AI Analyzes & Prioritizes
    ↓
Returns Aggregated Clusters
    ↓
Identifies Critical Cases
    ↓
Suggests Resources
    ↓
Recommends Actions
    ↓
Display on Coordinator Dashboard
```

## Scalability Considerations

### Horizontal Scaling
1. **Load Balancing**
   - Multiple API instances behind load balancer
   - Stateless design allows distribution
   - Session data in Firebase

2. **Database Scaling**
   - Firebase handles auto-scaling
   - Regional replication for failover
   - Caching layer (Redis) for frequent queries

3. **External Services**
   - Gemini API rate limits
   - Google Maps quota management
   - FCM high-volume delivery

### Vertical Scaling
1. **Increase Resources**
   - More memory for Node.js processes
   - Larger Cloud Function instances
   - Better CPU for computation

2. **Optimization**
   - Database indexing
   - Query optimization
   - Caching strategies

## Security Architecture

### Authentication & Authorization
```
┌─────────────────────────────────────────┐
│ User Login with Email/Password          │
│ (Future: OAuth 2.0, JWT)                │
└────────────────────┬────────────────────┘
                     ↓
         ┌───────────────────────┐
         │ Generate JWT Token    │
         │ Valid for 24 hours    │
         └───────────┬───────────┘
                     ↓
    ┌────────────────────────────────┐
    │ Include in Authorization Header│
    │ for Protected Routes           │
    └────────────────┬───────────────┘
                     ↓
    ┌────────────────────────────────┐
    │ Role-Based Access Control      │
    │ - Victim: Access own requests  │
    │ - Volunteer: View assignments  │
    │ - Coordinator: Full access     │
    └────────────────────────────────┘
```

### Data Protection
- TLS/SSL for all network communications
- Firebase security rules for database access
- API key restrictions and rotation
- Sensitive data encryption at rest

### Privacy
- GDPR compliance
- User consent for location sharing
- Data retention policies
- Secure deletion of archived data

## Reliability & Fault Tolerance

### Redundancy
1. **Database**
   - Multi-region replication
   - Automated backups
   - Point-in-time recovery

2. **Services**
   - Multiple Cloud Function instances
   - Auto-healing deployments
   - Circuit breakers for API calls

3. **Notifications**
   - Retry logic for failed deliveries
   - Exponential backoff
   - Dead letter queue

### Error Handling
```javascript
// Graceful degradation
try {
  const aggregation = await aggregateRequests();
} catch (error) {
  // Fall back to simple urgency scoring
  const fallback = requests.sort(byUrgency);
}
```

### Monitoring & Alerts
- Error rate monitoring
- API latency tracking
- Resource utilization alerts
- Database connection pool monitoring

## Performance Optimization

### Database Queries
```javascript
// Indexed queries
db.ref('disasterRequests')
  .orderByChild('status')
  .equalTo('open')
  .limitToFirst(100)

// Caching
const cached = lru.get('open_requests');
```

### API Response Time
- Response compression (gzip)
- Query result pagination
- Database query optimization
- Caching headers

### Frontend Optimization
- Code splitting (lazy loading)
- Image optimization
- Map tile caching
- Service worker for offline

## Deployment Architecture

### Development
```
Local Machine
├── Backend (npm start)
├── Frontend (npm run dev)
└── Firebase Emulator
```

### Staging
```
Google Cloud
├── Cloud Run (Backend)
├── Firebase Hosting (Frontend)
├── Cloud Functions
└── Realtime Database
```

### Production
```
Google Cloud (Multi-Region)
├── Cloud Run with load balancer
├── Firebase Hosting with CDN
├── Realtime Database (replicated)
├── Cloud Storage (backups)
└── Cloud Monitoring
```

## Future Enhancements

### Phase 2
- [ ] WebSocket support for real-time collaboration
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced AI (computer vision for damage assessment)
- [ ] Offline-first architecture

### Phase 3
- [ ] Blockchain for immutable disaster logs
- [ ] IoT sensor integration
- [ ] Drone coordination
- [ ] Insurance claim automation

### Phase 4
- [ ] Predictive disaster modeling
- [ ] Multi-language support
- [ ] Integration with government systems
- [ ] Autonomous vehicle dispatch

## Cost Estimation (Monthly)

### Google Cloud Services
- Cloud Run: $0.00003 per GB-second (~$100-200)
- Firebase Realtime DB: $1 per GB (~$50-100)
- Cloud Functions: Free tier included
- Cloud Storage: Pay as you go (~$0.020 per GB)

### External APIs
- Google Gemini: $0.00075 per 1K input tokens (~$50-100)
- Google Maps: $0.005 per request (~$100-200)
- Firebase Cloud Messaging: Free up to 100K

**Total Estimated Cost:** $300-600/month for 10,000 MAU

## Compliance & Regulations

- **GDPR**: Personal data handling
- **HIPAA**: If handling health information
- **ADA**: Accessibility compliance
- **Local Laws**: Emergency services regulations
