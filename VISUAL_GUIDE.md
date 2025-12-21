# Visual System Overview

## User Interface Flows

### Victim User Journey
```
┌──────────────────────────────────────────────────────────────┐
│ VICTIM EXPERIENCING DISASTER                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Registration/Login                                        │
│     ├─ Enter name, email                                      │
│     ├─ Allow location access                                 │
│     └─ Device token saved                                    │
│                                                               │
│  2. Dashboard Loads                                           │
│     ├─ Map shows current location                            │
│     ├─ Red button "🆘 Report Emergency" prominent            │
│     └─ Nearby requests displayed                             │
│                                                               │
│  3. Report Emergency                                          │
│     ├─ Select disaster type                                  │
│     ├─ Describe situation                                    │
│     ├─ Specify people affected                               │
│     ├─ Note injury severity                                  │
│     └─ Submit                                                │
│                                                               │
│  4. System Processing                                        │
│     ├─ ✅ Request created                                    │
│     ├─ 🔔 Volunteers notified (FCM)                         │
│     ├─ 🤖 AI analyzes situation                             │
│     └─ 📊 Coordinator sees on dashboard                      │
│                                                               │
│  5. Waiting for Help                                         │
│     ├─ Volunteer assigned                                    │
│     ├─ 🚗 See volunteer location                             │
│     ├─ ⏱️ ETA to arrival                                     │
│     └─ 🔔 Updates via notifications                          │
│                                                               │
│  6. Rescue Complete                                          │
│     ├─ ✅ Status updated to safe                            │
│     └─ ⭐ Rate volunteer                                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Volunteer User Journey
```
┌──────────────────────────────────────────────────────────────┐
│ VOLUNTEER PROVIDING HELP                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Registration                                              │
│     ├─ Enter skills/expertise                                │
│     ├─ Specify service area                                  │
│     └─ Max distance willing to travel                        │
│                                                               │
│  2. Go Online                                                │
│     ├─ 🟢 "Start Duty" button                                │
│     ├─ Location sharing activated                            │
│     └─ Status visible to coordinators                        │
│                                                               │
│  3. Assignment Received                                      │
│     ├─ 🔔 Push notification                                  │
│     ├─ Victim type & location                                │
│     ├─ Distance & ETA to site                                │
│     └─ Quick "Accept" button                                 │
│                                                               │
│  4. Navigate to Victim                                       │
│     ├─ 🗺️ Turn-by-turn navigation                            │
│     ├─ Real-time traffic conditions                          │
│     ├─ Victim contact info                                   │
│     └─ Safety notes from coordinator                         │
│                                                               │
│  5. Rescue & Assistance                                      │
│     ├─ Provide first aid/shelter/water                       │
│     ├─ Document victim status                                │
│     └─ Call emergency services if needed                     │
│                                                               │
│  6. Mark Complete                                            │
│     ├─ 🏁 Complete button                                    │
│     ├─ Add notes/observations                                │
│     ├─ Victim safety status                                  │
│     └─ Ready for next assignment                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Coordinator User Journey
```
┌──────────────────────────────────────────────────────────────┐
│ COORDINATOR MANAGING RESPONSE                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Real-time Dashboard                                      │
│     ├─ 🚨 Critical count: 3                                  │
│     ├─ ⚠️ High priority: 7                                   │
│     └─ 📊 Total open: 20                                     │
│                                                               │
│  2. AI Analysis Cards                                        │
│     ├─ CRITICAL (Red border)                                 │
│     │  ├─ Multiple building collapses cluster                │
│     │  ├─ ~15 victims estimated                              │
│     │  ├─ Recommended: Deploy rescue teams                   │
│     │  └─ Resources: rescue_team, medical, heavy_equipment   │
│     │                                                        │
│     └─ HIGH (Orange border)                                  │
│        ├─ Fire with trapped people                           │
│        └─ Recommended: Fire department + paramedics          │
│                                                               │
│  3. Dispatch Decision                                        │
│     ├─ Select cluster to handle                              │
│     ├─ Choose responsible volunteers                         │
│     ├─ View optimized route                                  │
│     └─ 📍 "Dispatch" button                                  │
│                                                               │
│  4. Route Optimization                                       │
│     ├─ 🤖 AI suggests optimal path                           │
│     ├─ 📍 Visit victims in priority order                    │
│     ├─ 🕐 Total time: 45 minutes                            │
│     └─ 🚗 Distance: 15.3 km                                 │
│                                                               │
│  5. Live Monitoring                                          │
│     ├─ 🗺️ Volunteer locations on map                         │
│     ├─ 📍 Active assignments                                 │
│     ├─ ⏱️ ETAs updating in real-time                        │
│     └─ 💬 Direct messaging to teams                         │
│                                                               │
│  6. After-Action                                             │
│     ├─ ✅ Completed assignments: 18                          │
│     ├─ ⏱️ Average response time: 12 minutes                  │
│     ├─ 🏥 Evacuated to hospitals: 45                         │
│     └─ ⭐ Volunteer performance ratings                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Emergency Report Processing
```
┌──────────────────┐
│  Victim Reports  │
│  Earthquake      │
│  8 affected      │
│  Critical injury │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Validate Location & Details  │
│ ✅ GPS coordinates valid     │
│ ✅ Injury level specified    │
│ ✅ People count reasonable   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Create Request in Database   │
│ requestId: req-12345         │
│ status: "open"               │
│ timestamp: 2024-01-01...     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Find Nearby Volunteers (5km radius)  │
│ Query: volunteers.location within    │
│ circle of (lat, lng, 5km)           │
└────────┬──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Send FCM Notifications       │
│ ├─ Mike (2.3 km away)       │
│ ├─ Sarah (3.1 km away)      │
│ └─ John (4.8 km away)       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Run AI Aggregation           │
│ (Background process)         │
│ ├─ Analyze request           │
│ ├─ Find nearby requests      │
│ ├─ Score priority            │
│ └─ Suggest resources         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Update Coordinator Dashboard │
│ ├─ New cluster detected      │
│ ├─ Priority: CRITICAL (9/10) │
│ ├─ Victims: 8                │
│ └─ Recommended: Dispatch 3   │
│    rescue teams              │
└──────────────────────────────┘
```

### Volunteer Assignment Matching
```
┌─────────────────────────────┐
│  Coordinator Initiates      │
│  Volunteer Assignment       │
│  Input: req-id, volunteer-id│
└──────────┬──────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Fetch Request Details            │
│  - Location (40.7128, -74.0060)   │
│  - Victim info & injury           │
│  - Time created                   │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Fetch Volunteer Details          │
│  - Current location               │
│  - Skills/expertise               │
│  - Active assignments             │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Calculate Match Score            │
│  ├─ Distance: 2.3 km (90 pts)    │
│  ├─ Skills match: 85% (85 pts)   │
│  ├─ Availability: yes (100 pts)  │
│  └─ Total: 91.7 pts (Excellent)  │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Calculate Routing                │
│  ├─ Current pos → Victim pos      │
│  ├─ Route: 2.3 km via Main St     │
│  ├─ ETA: 12 minutes               │
│  └─ Traffic: Light                │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Create Assignment Record         │
│  assignmentId: assign-99999       │
│  status: "assigned"               │
│  estimatedArrivalMinutes: 12      │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Send FCM to Volunteer            │
│  "New Rescue Assignment"           │
│  "2.3 km away, 12 min ETA"        │
│  [Accept] [Decline] buttons       │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Volunteer Accepts                │
│  ├─ Update assignment: "in_prog"  │
│  ├─ Share location in real-time   │
│  ├─ Start navigation              │
│  └─ Notify coordinator            │
└───────────────────────────────────┘
```

### AI Aggregation Process
```
┌──────────────────────────┐
│  Get All Open Requests   │
│  Total: 47 requests      │
│  Spread across 25 km²    │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Send to Google Gemini API                      │
│  Prompt: "Analyze these disaster requests..."  │
│  Model: gemini-pro                              │
│  Max tokens: 1024                               │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  Gemini Analysis Results (JSON)                            │
│  ├─ Cluster 1: Building Collapses (Downtown)              │
│  │  ├─ Priority: CRITICAL (9/10)                          │
│  │  ├─ Victims: ~25 people                                │
│  │  ├─ Location center: (40.7200, -74.0040)              │
│  │  ├─ Resources: rescue_team, medical_team, heavy_eq    │
│  │  └─ Action: "Immediately dispatch all rescue teams"   │
│  │                                                        │
│  ├─ Cluster 2: Fires (Midtown)                            │
│  │  ├─ Priority: HIGH (8/10)                              │
│  │  ├─ Victims: ~12 people                                │
│  │  ├─ Resources: fire_dept, paramedics, evacuation      │
│  │  └─ Action: "Call fire department and paramedics"     │
│  │                                                        │
│  └─ Cluster 3: Minor Injuries (Uptown)                    │
│     ├─ Priority: MEDIUM (5/10)                            │
│     ├─ Victims: ~8 people                                 │
│     └─ Resources: first_aid_supplies, transport          │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Format for Coordinator Dashboard      │
│  ├─ Color code by priority             │
│ (Red=CRITICAL, Orange=HIGH, Yellow=MED)│
│  ├─ Calculate victim estimates         │
│  ├─ Generate action items              │
│  └─ Display suggested resources        │
└────────┬─────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Real-time Dashboard Update            │
│  ├─ Refresh: < 1 second                │
│  ├─ Auto-refresh: every 5 seconds      │
│  └─ Coordinator sees latest info       │
└────────────────────────────────────────┘
```

---

## Route Optimization Visualization

### Before Optimization
```
Volunteer at O -> Victims: A, B, C, D, E

Naive Route: O -> A -> B -> C -> D -> E -> O
Distance: 18.2 km | Time: 58 minutes

    [A]
  /     \
 O       [B]
  \     /
   [E] [C]
    \ /
    [D]
```

### After Optimization (TSP)
```
Volunteer at O -> Victims: A, B, C, D, E

Optimized Route: O -> A -> C -> E -> D -> B -> O
Distance: 10.3 km | Time: 32 minutes

    [A]
  /     \
 O---[B] (10.3 km total)
  \     /
   [E][C]
   /  \
 [D]
```

### Result
- **Distance saved:** 43% (18.2 → 10.3 km)
- **Time saved:** 45% (58 → 32 minutes)
- **Victims served:** 5 in same time as previously 2-3

---

## Real-time Location Tracking

```
┌─────────────────────────────────────────────────────┐
│ LIVE COORDINATOR VIEW                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🗺️ Map                    📊 Assignments         │
│  ┌──────────────────┐      ┌─────────────────┐   │
│  │                  │      │ Active: 8/12    │   │
│  │  [M] 🚗          │      │ Completed: 15   │   │
│  │      (12:45)     │      │ Pending: 4      │   │
│  │                  │      └─────────────────┘   │
│  │ Volunteer Mike   │                             │
│  │ Distance: 1.2 km │      Assignments           │
│  │ ETA: 7 min       │      ┌─────────────────┐   │
│  │                  │      │ Request #1      │   │
│  │ [S] 👤           │      │ Victim: Sarah   │   │
│  │                  │      │ Status: In Prog │   │
│  │ Victim Sarah     │      │ ETA: 7 min      │   │
│  │                  │      └─────────────────┘   │
│  │                  │      ┌─────────────────┐   │
│  │ [J]              │      │ Request #2      │   │
│  │      (19:32)     │      │ Victim: John    │   │
│  │ John (Assigned)  │      │ Status: Assigned│   │
│  │ ETA: 19 min      │      │ ETA: 19 min     │   │
│  │                  │      └─────────────────┘   │
│  │         [A]      │                             │
│  │    (37:18)       │      Stats                  │
│  │ Alice (Pending)  │      ┌─────────────────┐   │
│  │                  │      │ Total Distance  │   │
│  │ Nearby Hospital  │      │ Covered: 24 km  │   │
│  │ (via Maps API)   │      │ Avg Response: 9 │   │
│  │                  │      │ minutes         │   │
│  └──────────────────┘      └─────────────────┘   │
│                                                   │
│ Last Update: 12:45:32 | Auto-refresh: 5s        │
└─────────────────────────────────────────────────────┘
```

---

## System Response Timeline

### Typical Disaster Response (Minutes)
```
0:00  ┌─ Victim Reports Emergency
      │  (via app or phone)
      │
0:05  ├─ Request Created & Processed
      │  ✅ Registered in database
      │  ✅ Nearby volunteers notified (FCM)
      │
0:10  ├─ Volunteer Accepts
      │  ✅ Assignment confirmed
      │  ✅ Route calculated
      │  ✅ Navigation started
      │
0:15  ├─ Coordinator Dispatches Additional Support
      │  ✅ AI analysis complete
      │  ✅ Route optimization running
      │  ✅ Strategies generated
      │
0:20  ├─ First Volunteer Arrives
      │  ✅ Victim located
      │  ✅ First aid/assessment
      │  ✅ Coordinator notified
      │
0:30  ├─ Additional Teams Arrive (if needed)
      │  ✅ Medical team on scene
      │  ✅ Evacuation begins
      │
0:45  ├─ Incident Stabilized
      │  ✅ Victims transported
      │  ✅ Scene secured
      │  ✅ Notes documented
      │
1:00  └─ Assignments Completed
         ✅ All records updated
         ✅ Volunteer ratings submitted
         ✅ Ready for next emergency
```

---

## Disaster Severity Levels

```
Priority Level | Urgency | Response Time | Resources
───────────────┼─────────┼──────────────┼─────────────
CRITICAL       | 9-10    | < 5 minutes  | Full deployment
HIGH           | 7-8     | 5-15 min     | 2-3 teams
MEDIUM         | 5-6     | 15-30 min    | 1-2 teams
LOW            | 1-4     | 30+ min      | Single volunteer
```

---

This visual documentation helps understand:
- User interactions & workflows
- Data processing pipelines
- Route optimization benefits
- Real-time coordination
- Response timeline expectations
