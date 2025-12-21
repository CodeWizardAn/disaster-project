import express from 'express';
import {
  aggregateDisasterRequests,
  analyzeRequestContext,
  generateRescueStrategy
} from '../services/geminaiService.js';
import { optimizeRescueRoute, getETA } from '../services/routingService.js';
import { dbOperations, notificationService, db } from '../services/firebaseService.js';

const router = express.Router();

/**
 * Aggregate and prioritize all open disaster requests
 */
router.post('/aggregate', async (req, res) => {
  try {
    const openRequests = await dbOperations.getDisasterRequests({ status: 'open' });

    if (openRequests.length === 0) {
      return res.json({
        aggregated: [],
        summary: 'No open requests'
      });
    }

    const aggregated = await aggregateDisasterRequests(openRequests);

    res.json({
      success: true,
      totalRequests: openRequests.length,
      aggregated: aggregated.aggregated || [],
      summary: aggregated.summary || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze a specific request with context
 */
router.post('/analyze/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const allRequests = await dbOperations.getDisasterRequests();
    const request = allRequests.find(r => r.id === requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Find nearby requests
    const nearbyRequests = allRequests.filter(r => {
      if (r.id === requestId || r.status === 'completed') return false;
      const distance = calculateDistance(
        request.latitude,
        request.longitude,
        r.latitude,
        r.longitude
      );
      return distance <= 2; // Within 2km
    });

    const analysis = await analyzeRequestContext(request, nearbyRequests);

    res.json({
      success: true,
      requestId,
      analysis,
      nearbyRequestsCount: nearbyRequests.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate rescue strategy for a cluster
 */
router.post('/strategy', async (req, res) => {
  try {
    const { requestIds, availableVolunteerIds } = req.body;

    if (!requestIds || requestIds.length === 0) {
      return res.status(400).json({ error: 'Request IDs required' });
    }

    const allRequests = await dbOperations.getDisasterRequests();
    const clusterRequests = allRequests.filter(r => requestIds.includes(r.id));

    const cluster = {
      totalPeople: clusterRequests.reduce((sum, r) => sum + (r.peopleAffected || 1), 0),
      geographicSpread: calculateClusterSpread(clusterRequests),
      requestCount: clusterRequests.length,
      priorities: clusterRequests.map(r => r.type),
      availableResources: availableVolunteerIds || []
    };

    const strategy = await generateRescueStrategy(cluster);

    res.json({
      success: true,
      strategy,
      cluster
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create smart matching between volunteers and requests
 */
router.post('/match', async (req, res) => {
  try {
    const { requestId, volunteerId } = req.body;

    if (!requestId || !volunteerId) {
      return res.status(400).json({ error: 'Request ID and Volunteer ID required' });
    }

    // Get request and volunteer details
    const requests = await dbOperations.getDisasterRequests();
    const request = requests.find(r => r.id === requestId);
    const volunteer = await dbOperations.getUser(volunteerId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Calculate ETA
    const eta = await getETA(
      volunteer.currentLocation || { lat: 0, lng: 0 },
      { lat: request.latitude, lng: request.longitude }
    );

    // Create assignment
    const assignment = {
      volunteerId,
      requestId,
      victimUserId: request.userId,
      victimLocation: {
        lat: request.latitude,
        lng: request.longitude
      },
      volunteerName: volunteer.name,
      estimatedArrivalMinutes: eta.durationMinutes,
      distanceKm: eta.distanceKm,
      createdAt: new Date().toISOString()
    };

    const assignmentResult = await dbOperations.createAssignment(assignment);

    // Notify volunteer
    if (volunteer.deviceToken) {
      await notificationService.sendToUser(
        volunteerId,
        'New Rescue Assignment',
        `New assignment ${Math.round(eta.distanceKm)}km away, ETA: ${eta.durationMinutes} minutes`,
        {
          assignmentId: assignmentResult.assignmentId,
          requestId,
          latitude: request.latitude.toString(),
          longitude: request.longitude.toString()
        }
      );
    }

    res.json({
      success: true,
      assignmentId: assignmentResult.assignmentId,
      assignment,
      eta
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get optimized rescue route
 */
router.post('/route-optimize', async (req, res) => {
  try {
    const { origin, destinationIds } = req.body;

    if (!origin || !destinationIds || destinationIds.length === 0) {
      return res.status(400).json({ error: 'Origin and destination IDs required' });
    }

    // Get requests for destinations
    const requests = await dbOperations.getDisasterRequests();
    const destinations = requests
      .filter(r => destinationIds.includes(r.id))
      .map(r => ({
        id: r.id,
        lat: r.latitude,
        lng: r.longitude,
        type: r.type
      }));

    if (destinations.length === 0) {
      return res.status(404).json({ error: 'No requests found' });
    }

    const optimizedRoute = await optimizeRescueRoute(origin, destinations);

    res.json({
      success: true,
      ...optimizedRoute
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get real-time coordination dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const openRequests = await dbOperations.getDisasterRequests({ status: 'open' });
    const aggregated = await aggregateDisasterRequests(openRequests);

    // Active volunteers count
    const volunteersSnap = await db.ref('volunteers').once('value');
    const volunteersData = volunteersSnap.val() || {};
    const volunteersArray = Object.entries(volunteersData).map(([id, v]) => ({ id, ...v }));
    const activeVolunteers = volunteersArray.filter(v => v.available && v.currentLocation);

    // In-progress assignments with ETAs
    const assignmentsSnap = await db.ref('assignments').once('value');
    const assignmentsData = assignmentsSnap.val() || {};
    const assignmentsArray = Object.entries(assignmentsData).map(([id, a]) => ({ id, ...a }));
    const inProgressAssignments = assignmentsArray.filter(a => a.status === 'in_progress');

    const withEtas = await Promise.all(
      inProgressAssignments.map(async (a) => {
        let eta = a.eta || null;
        try {
          const volunteer = volunteersArray.find(v => v.id === a.volunteerId);
          if (volunteer?.currentLocation && a.victimLocation) {
            const res = await getETA(volunteer.currentLocation, a.victimLocation);
            eta = {
              distanceKm: res.distanceKm,
              durationMinutes: res.durationMinutes,
              estimatedArrival: res.estimatedArrival
            };
          }
        } catch (e) {
          // keep existing eta if available
        }
        return {
          assignmentId: a.id,
          volunteerId: a.volunteerId,
          volunteerName: a.volunteerName,
          requestId: a.requestId,
          eta
        };
      })
    );

    res.json({
      timestamp: new Date().toISOString(),
      totalRequests: openRequests.length,
      aggregated: aggregated.aggregated || [],
      summary: aggregated.summary || '',
      criticalCount: (aggregated.aggregated || []).filter(a => a.priority === 'CRITICAL').length,
      highCount: (aggregated.aggregated || []).filter(a => a.priority === 'HIGH').length,
      volunteersActiveCount: activeVolunteers.length,
      assignmentsInProgress: withEtas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateClusterSpread(requests) {
  if (requests.length <= 1) return 0;

  let maxDistance = 0;
  for (let i = 0; i < requests.length; i++) {
    for (let j = i + 1; j < requests.length; j++) {
      const distance = calculateDistance(
        requests[i].latitude,
        requests[i].longitude,
        requests[j].latitude,
        requests[j].longitude
      );
      maxDistance = Math.max(maxDistance, distance);
    }
  }
  return maxDistance;
}

export default router;
