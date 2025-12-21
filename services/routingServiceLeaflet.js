// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Traveling Salesman Problem solver using nearest neighbor heuristic
function solveNearestNeighbor(startPoint, destinations) {
  if (destinations.length === 0) return [];

  const route = [startPoint];
  const remaining = [...destinations];
  let current = startPoint;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    // Find nearest unvisited destination
    for (let i = 0; i < remaining.length; i++) {
      const distance = haversineDistance(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestIdx = i;
      }
    }

    current = remaining[nearestIdx];
    route.push(current);
    remaining.splice(nearestIdx, 1);
  }

  return route;
}

// Cluster destinations for large-scale optimization
function clusterDestinations(destinations, clusterRadius = 2) {
  if (destinations.length <= 25) return [destinations];

  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < destinations.length; i++) {
    if (visited.has(i)) continue;

    const cluster = [destinations[i]];
    visited.add(i);

    for (let j = i + 1; j < destinations.length; j++) {
      if (visited.has(j)) continue;

      const distance = haversineDistance(
        destinations[i].lat,
        destinations[i].lng,
        destinations[j].lat,
        destinations[j].lng
      );

      if (distance <= clusterRadius) {
        cluster.push(destinations[j]);
        visited.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

// Calculate estimated travel time (5 km/h average for disaster areas)
function estimateTravelTime(distance) {
  const avgSpeed = 5; // km/h in disaster area
  return (distance / avgSpeed) * 60; // minutes
}

// Main optimization function
export async function optimizeRescueRoute(startPoint, destinations) {
  try {
    if (!startPoint || !destinations || destinations.length === 0) {
      return {
        success: false,
        message: 'Start point and destinations required',
      };
    }

    let route;

    if (destinations.length <= 25) {
      // Small set: direct TSP solving
      route = solveNearestNeighbor(startPoint, destinations);
    } else {
      // Large set: cluster first, then optimize each cluster
      const clusters = clusterDestinations(destinations);
      route = [startPoint];

      // Process each cluster
      for (const cluster of clusters) {
        const clusterRoute = solveNearestNeighbor(
          route[route.length - 1],
          cluster
        );
        // Skip the first point (it's the current location)
        route = [...route, ...clusterRoute.slice(1)];
      }
    }

    // Calculate route metrics
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const distance = haversineDistance(
        route[i].lat,
        route[i].lng,
        route[i + 1].lat,
        route[i + 1].lng
      );
      totalDistance += distance;
      totalTime += estimateTravelTime(distance);
    }

    // Create waypoints
    const waypoints = route.map((point, index) => ({
      index,
      lat: point.lat,
      lng: point.lng,
      name: point.name || `Stop ${index}`,
      distance: index === 0 ? 0 : haversineDistance(
        route[index - 1].lat,
        route[index - 1].lng,
        point.lat,
        point.lng
      ),
    }));

    return {
      success: true,
      route,
      waypoints,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      estimatedTime: Math.ceil(totalTime),
      estimatedTimeHours: parseFloat((totalTime / 60).toFixed(1)),
    };
  } catch (error) {
    console.error('Route optimization error:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// Find nearby volunteers
export function findNearbyVolunteers(victimLocation, volunteers, radius = 5) {
  return volunteers
    .map(volunteer => ({
      ...volunteer,
      distance: haversineDistance(
        victimLocation.lat,
        victimLocation.lng,
        volunteer.currentLocation?.lat || 0,
        volunteer.currentLocation?.lng || 0
      ),
    }))
    .filter(v => v.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

// Calculate ETA between two points
export function calculateETA(startLat, startLng, endLat, endLng) {
  const distance = haversineDistance(startLat, startLng, endLat, endLng);
  const timeMinutes = estimateTravelTime(distance);
  
  return {
    distance: parseFloat(distance.toFixed(2)),
    timeMinutes: Math.ceil(timeMinutes),
    timeHours: parseFloat((timeMinutes / 60).toFixed(1)),
  };
}

// Get directions as waypoints (simple version)
export function getDirections(startPoint, endPoint) {
  const distance = haversineDistance(
    startPoint.lat,
    startPoint.lng,
    endPoint.lat,
    endPoint.lng
  );

  const direction = {
    distance: parseFloat(distance.toFixed(2)),
    duration: estimateTravelTime(distance),
    steps: [
      {
        instruction: `Head towards ${endPoint.name || 'destination'}`,
        distance: parseFloat(distance.toFixed(2)),
        duration: estimateTravelTime(distance),
      },
    ],
  };

  return direction;
}

// Find nearby facilities (hospitals, police stations) - using sample data
export function findNearbyFacilities(location, facilityType = 'hospital', radius = 10) {
  // Sample facilities data
  const sampleFacilities = {
    hospital: [
      { name: 'City Hospital', lat: 20.5937, lng: 78.9629, type: 'hospital' },
      { name: 'Medical Center', lat: 20.6, lng: 78.97, type: 'hospital' },
    ],
    police: [
      { name: 'Police Station', lat: 20.59, lng: 78.96, type: 'police' },
      { name: 'Emergency Response', lat: 20.6, lng: 78.96, type: 'police' },
    ],
    shelter: [
      { name: 'Relief Center', lat: 20.58, lng: 78.96, type: 'shelter' },
      { name: 'Community Center', lat: 20.6, lng: 78.97, type: 'shelter' },
    ],
  };

  const facilities = sampleFacilities[facilityType] || [];

  return facilities
    .map(facility => ({
      ...facility,
      distance: haversineDistance(
        location.lat,
        location.lng,
        facility.lat,
        facility.lng
      ),
    }))
    .filter(f => f.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}
