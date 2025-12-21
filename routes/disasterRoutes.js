import express from 'express';
import { dbOperations, notificationService } from '../services/firebaseService.js';
import { aggregateDisasterRequests, analyzeRequestContext } from '../services/geminaiService.js';
import { optimizeRescueRoute, getETA, findNearbyFacilities } from '../services/routingService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Report disaster status - mark unsafe (needs help)
 */
router.post('/mark-unsafe', async (req, res) => {
  try {
    const {
      userId,
      latitude,
      longitude,
      type,
      description,
      peopleAffected,
      injuryLevel,
      accessibility
    } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const requestData = {
      userId,
      latitude,
      longitude,
      type: type || 'unknown',
      description: description || '',
      peopleAffected: peopleAffected || 1,
      injuryLevel: injuryLevel || 'unknown',
      accessibility: accessibility || 'unknown',
      status: 'open'
    };

    const result = await dbOperations.createDisasterRequest(requestData);

    // Get user info for notifications
    const user = await dbOperations.getUser(userId);

    // Notify nearby users and volunteers
    const nearbyVolunteers = await dbOperations.getVolunteersNearby(latitude, longitude, 5);
    if (nearbyVolunteers.length > 0) {
      const tokens = nearbyVolunteers
        .filter(v => v.deviceToken)
        .map(v => v.deviceToken);

      if (tokens.length > 0) {
        await notificationService.sendMulticast(
          tokens,
          'New Rescue Request Nearby',
          `${user.name || 'Someone'} needs help at (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          { requestId: result.requestId, type }
        );
      }
    }

    res.json({
      success: true,
      requestId: result.requestId,
      message: 'Request created and volunteers notified'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Report being safe
 */
router.post('/mark-safe', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    await dbOperations.updateUser(userId, {
      safetyStatus: 'safe',
      lastSafetyUpdate: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Status marked as safe'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get nearby help requests
 */
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radiusKm = req.query.radius || 5;

    const allRequests = await dbOperations.getDisasterRequests({ status: 'open' });

    // Filter by distance
    const nearbyRequests = allRequests.filter(req => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        req.latitude,
        req.longitude
      );
      return distance <= radiusKm;
    });

    // Sort by urgency (using fallback calculation)
    nearbyRequests.sort((a, b) => {
      const scoreA = calculateUrgencyScore(a);
      const scoreB = calculateUrgencyScore(b);
      return scoreB - scoreA;
    });

    res.json({
      count: nearbyRequests.length,
      radius: radiusKm,
      requests: nearbyRequests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all open requests (for AI aggregation)
 */
router.get('/all/open', async (req, res) => {
  try {
    const requests = await dbOperations.getDisasterRequests({ status: 'open' });
    res.json({
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update request status
 */
router.put('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, assignedVolunteerId } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (assignedVolunteerId) updates.assignedVolunteerId = assignedVolunteerId;

    await dbOperations.updateDisasterRequest(requestId, updates);

    res.json({
      success: true,
      message: 'Request updated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get request details
 */
router.get('/:requestId/details', async (req, res) => {
  try {
    const { requestId } = req.params;
    const requests = await dbOperations.getDisasterRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get nearby facilities
    const hospitals = await findNearbyFacilities(
      { lat: request.latitude, lng: request.longitude },
      'hospital'
    );

    const policeStations = await findNearbyFacilities(
      { lat: request.latitude, lng: request.longitude },
      'police'
    );

    res.json({
      ...request,
      nearbyHospitals: hospitals,
      nearbyPoliceStations: policeStations
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

function calculateUrgencyScore(request) {
  let score = 5;
  const injuryMap = { critical: 4, severe: 3, moderate: 2, minor: 1 };
  score += injuryMap[request.injuryLevel] || 0;
  if (request.peopleAffected && request.peopleAffected > 5) score += 2;
  const typeUrgency = { building_collapse: 3, fire: 3, drowning: 3, landslide: 2, earthquake: 3 };
  score += typeUrgency[request.type] || 0;
  return Math.min(score, 10);
}

export default router;
