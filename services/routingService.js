import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Calculate optimal rescue route using Google Maps Distance Matrix API
 * Implements a simplified Traveling Salesman Problem solution
 */
export async function optimizeRescueRoute(origin, destinations) {
  if (!destinations || destinations.length === 0) {
    return { route: [], totalDistance: 0, totalDuration: 0 };
  }

  try {
    // For more than 25 destinations, use clustering approach
    if (destinations.length > 25) {
      return optimizeRouteClustered(origin, destinations);
    }

    // Get distance matrix
    const distanceMatrix = await getDistanceMatrix(origin, destinations);

    if (!distanceMatrix.rows || distanceMatrix.rows.length === 0) {
      throw new Error('Invalid distance matrix response');
    }

    // Solve TSP using nearest neighbor heuristic
    const route = solveNearestNeighbor(origin, destinations, distanceMatrix);

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const fromIdx = route[i];
      const toIdx = route[i + 1];
      
      if (fromIdx === -1) { // Origin
        const element = distanceMatrix.rows[0].elements[toIdx];
        totalDistance += element.distance?.value || 0;
        totalDuration += element.duration?.value || 0;
      } else if (toIdx === -1) { // Back to origin
        // Would need return distance
      } else {
        // Destination to destination
        const element = distanceMatrix.rows[fromIdx + 1].elements[toIdx];
        if (element && element.distance) {
          totalDistance += element.distance.value;
          totalDuration += element.duration.value;
        }
      }
    }

    return {
      route: route.map(idx => idx === -1 ? origin : destinations[idx]),
      totalDistance: Math.round(totalDistance / 1000), // Convert to km
      totalDuration: Math.round(totalDuration / 60), // Convert to minutes
      waypoints: destinations.map((dest, idx) => ({
        ...dest,
        sequence: route.indexOf(idx)
      }))
    };
  } catch (error) {
    console.error('Error optimizing route:', error);
    return {
      route: [origin, ...destinations],
      totalDistance: 0,
      totalDuration: 0,
      error: error.message
    };
  }
}

/**
 * Optimize route for large number of destinations using clustering
 */
async function optimizeRouteClustered(origin, destinations) {
  try {
    // Cluster destinations by proximity
    const clusters = clusterDestinations(origin, destinations, 5);

    const allRoutes = [];
    let totalDistance = 0;
    let totalDuration = 0;

    for (const cluster of clusters) {
      const clusterRoute = await optimizeRescueRoute(origin, cluster);
      allRoutes.push(...clusterRoute.route);
      totalDistance += clusterRoute.totalDistance;
      totalDuration += clusterRoute.totalDuration;
    }

    return {
      route: allRoutes,
      totalDistance,
      totalDuration,
      clusters: clusters.length,
      usedClustering: true
    };
  } catch (error) {
    console.error('Error in clustered routing:', error);
    return {
      route: [origin, ...destinations],
      totalDistance: 0,
      totalDuration: 0,
      error: error.message
    };
  }
}

/**
 * Get distance matrix from Google Maps API
 */
async function getDistanceMatrix(origin, destinations) {
  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStrs = destinations
      .map(d => `${d.lat},${d.lng}`)
      .join('|');

    const response = await axios.get(`${BASE_URL}/distancematrix/json`, {
      params: {
        origins: originStr,
        destinations: destinationStrs,
        key: MAPS_API_KEY,
        mode: 'driving'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting distance matrix:', error);
    throw error;
  }
}

/**
 * Solve TSP using Nearest Neighbor heuristic
 */
function solveNearestNeighbor(origin, destinations, distanceMatrix) {
  const n = destinations.length;
  const visited = new Array(n).fill(false);
  const route = [-1]; // Start at origin

  let currentIdx = -1; // Current position (origin)

  for (let i = 0; i < n; i++) {
    let nearestIdx = -1;
    let nearestDistance = Infinity;

    for (let j = 0; j < n; j++) {
      if (visited[j]) continue;

      let distance;
      if (currentIdx === -1) {
        // From origin
        distance = distanceMatrix.rows[0].elements[j]?.distance?.value || Infinity;
      } else {
        // Between destinations
        distance = distanceMatrix.rows[currentIdx + 1]?.elements[j]?.distance?.value || Infinity;
      }

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIdx = j;
      }
    }

    if (nearestIdx !== -1) {
      visited[nearestIdx] = true;
      route.push(nearestIdx);
      currentIdx = nearestIdx;
    }
  }

  route.push(-1); // Return to origin
  return route;
}

/**
 * Cluster destinations by proximity
 */
function clusterDestinations(origin, destinations, maxPerCluster = 10) {
  const clusters = [];
  const used = new Set();

  for (const dest of destinations) {
    if (used.has(dest.id)) continue;

    const cluster = [dest];
    used.add(dest.id);

    if (cluster.length < maxPerCluster) {
      for (const other of destinations) {
        if (used.has(other.id)) continue;
        if (cluster.length >= maxPerCluster) break;

        const distance = calculateDistance(dest.lat, dest.lng, other.lat, other.lng);
        if (distance < 2) { // Within 2km
          cluster.push(other);
          used.add(other.id);
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Get directions between two points
 */
export async function getDirections(origin, destination) {
  try {
    const response = await axios.get(`${BASE_URL}/directions/json`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: MAPS_API_KEY,
        mode: 'driving'
      }
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.legs[0].distance.value,
        duration: route.legs[0].duration.value,
        polyline: route.overview_polyline.points,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.value,
          duration: step.duration.value
        }))
      };
    }

    return { error: 'No route found' };
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
}

/**
 * Calculate ETA based on current traffic
 */
export async function getETA(origin, destination) {
  try {
    const directions = await getDirections(origin, destination);
    return {
      distanceKm: Math.round(directions.distance / 1000),
      durationMinutes: Math.round(directions.duration / 60),
      estimatedArrival: new Date(Date.now() + directions.duration * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error calculating ETA:', error);
    return { error: error.message };
  }
}

/**
 * Find nearby facilities (hospitals, police stations, etc.)
 */
export async function findNearbyFacilities(location, type = 'hospital', radius = 5000) {
  try {
    const response = await axios.get(`${BASE_URL}/place/nearbysearch/json`, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius: radius,
        type: type,
        key: MAPS_API_KEY
      }
    });

    return response.data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      rating: place.rating,
      openNow: place.opening_hours?.open_now
    }));
  } catch (error) {
    console.error('Error finding nearby facilities:', error);
    return [];
  }
}

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

export default {
  optimizeRescueRoute,
  getDirections,
  getETA,
  findNearbyFacilities
};
