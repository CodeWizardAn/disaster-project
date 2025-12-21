import express from 'express';
import { dbOperations, notificationService, db } from '../services/firebaseService.js';
import { getETA } from '../services/routingService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Register as a volunteer
 */
router.post('/register', async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      expertise,
      skills,
      availability,
      maxDistance
    } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const volunteerId = userId; // Use user ID as volunteer ID

    const volunteerData = {
      name,
      email,
      phone,
      expertise: expertise || [], // ['rescue', 'medical', 'coordination']
      skills: skills || [],
      availability: availability || true,
      maxDistance: maxDistance || 10, // km
      currentLocation: null,
      totalAssignments: 0,
      completedAssignments: 0,
      rating: 0
    };

    await dbOperations.registerVolunteer(volunteerId, volunteerData);

    res.json({
      success: true,
      volunteerId,
      message: 'Volunteer registered successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update volunteer location (real-time tracking)
 */
router.post('/:volunteerId/location', async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    await dbOperations.updateVolunteerLocation(volunteerId, latitude, longitude);

    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get volunteer assignments
 */
router.get('/:volunteerId/assignments', async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const assignments = await dbOperations.getVolunteerAssignments(volunteerId);

    // Compute ETA for active assignments using volunteer's current location if available
    const volunteerSnap = await db.ref(`volunteers/${volunteerId}`).once('value');
    const volunteerData = volunteerSnap.val() || {};
    const origin = volunteerData.currentLocation || null;
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        let eta = null;
        if (origin && a.victimLocation && a.victimLocation.lat && a.victimLocation.lng) {
          try {
            const res = await getETA(origin, { lat: a.victimLocation.lat, lng: a.victimLocation.lng });
            eta = res;
          } catch (e) {
            eta = null;
          }
        }
        return {
          ...a,
          eta: eta
            ? {
                distanceKm: eta.distanceKm,
                durationMinutes: eta.durationMinutes,
                estimatedArrival: eta.estimatedArrival
              }
            : a.eta || null
        };
      })
    );

    res.json({
      volunteerId,
      activeAssignments: enriched.filter(a => a.status === 'assigned' || a.status === 'in_progress'),
      completedAssignments: assignments.filter(a => a.status === 'completed'),
      total: assignments.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Accept assignment
 */
router.post('/:volunteerId/accept/:assignmentId', async (req, res) => {
  try {
    const { volunteerId, assignmentId } = req.params;

    // Load assignment
    const assignmentSnap = await db.ref(`assignments/${assignmentId}`).once('value');
    const assignment = assignmentSnap.val();
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Validate volunteer
    if (assignment.volunteerId && assignment.volunteerId !== volunteerId) {
      return res.status(400).json({ error: 'Assignment belongs to another volunteer' });
    }

    // Get volunteer current location
    const volunteerSnap = await db.ref(`volunteers/${volunteerId}`).once('value');
    const volunteerData = volunteerSnap.val() || {};
    const origin = volunteerData.currentLocation;

    // Calculate ETA
    let eta = null;
    if (origin && assignment.victimLocation) {
      try {
        eta = await getETA(origin, assignment.victimLocation);
      } catch (e) {
        eta = null;
      }
    }

    // Update assignment status and attach ETA
    await db.ref(`assignments/${assignmentId}`).update({
      status: 'in_progress',
      acceptedAt: new Date().toISOString(),
      eta: eta
        ? {
            distanceKm: eta.distanceKm,
            durationMinutes: eta.durationMinutes,
            estimatedArrival: eta.estimatedArrival
          }
        : assignment.eta || null
    });

    res.json({
      success: true,
      message: 'Assignment accepted',
      assignmentId,
      eta
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Complete assignment
 */
router.post('/:volunteerId/complete/:assignmentId', async (req, res) => {
  try {
    const { volunteerId, assignmentId } = req.params;
    const { notes, victimSafetyStatus } = req.body;

    // Mark assignment completed
    await db.ref(`assignments/${assignmentId}`).update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: volunteerId,
      notes: notes || '',
      victimFinalStatus: victimSafetyStatus || 'safe'
    });

    // Also mark underlying disaster request as completed if known
    const assignmentSnap = await db.ref(`assignments/${assignmentId}`).once('value');
    const assignment = assignmentSnap.val();
    if (assignment?.requestId) {
      await dbOperations.updateDisasterRequest(assignment.requestId, {
        status: 'completed',
        updatedBy: volunteerId
      });
    }

    res.json({
      success: true,
      message: 'Assignment completed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update volunteer availability
 */
router.put('/:volunteerId/availability', async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'Availability boolean required' });
    }

    const volunteer = await dbOperations.getUser(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await dbOperations.updateUser(volunteerId, {
      available,
      availabilityUpdatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      available,
      message: 'Availability updated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get available volunteers nearby
 */
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radiusKm = req.query.radius || 10;

    const volunteers = await dbOperations.getVolunteersNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusKm)
    );

    res.json({
      count: volunteers.length,
      radius: radiusKm,
      volunteers: volunteers.map(v => ({
        id: v.id,
        name: v.name,
        expertise: v.expertise,
        phone: v.phone,
        rating: v.rating,
        completedAssignments: v.completedAssignments || 0,
        distance: calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          v.currentLocation.lat,
          v.currentLocation.lng
        ).toFixed(2),
        available: v.available,
        currentLocation: v.currentLocation
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
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

export default router;
