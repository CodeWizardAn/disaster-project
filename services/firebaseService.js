import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK - support loading service account from JSON file path
let firebaseApp;

try {
  let serviceAccount = null;

  // 1) If user provided a path to the service account JSON file, load it
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (svcPath) {
    const resolved = path.isAbsolute(svcPath) ? svcPath : path.join(process.cwd(), svcPath);
    if (fs.existsSync(resolved)) {
      const raw = fs.readFileSync(resolved, 'utf8');
      serviceAccount = JSON.parse(raw);
    } else {
      console.warn(`Service account file not found at ${resolved}`);
    }
  }

  // 2) If not provided as file, try reading from individual environment variables
  if (!serviceAccount && process.env.FIREBASE_PROJECT_ID) {
    serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL
    };
  }

  if (!serviceAccount) {
    throw new Error('Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY (path) or FIREBASE_PROJECT_ID env variables.');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('⚠️ Firebase initialization warning:', error.message);
  console.log('ℹ️ Running in mock mode. Set up Firebase credentials in .env or provide service account JSON to enable real functionality');
}

// Database reference
let db = null;

// Firestore for document storage (optional)
let firestore = null;

// Firebase Authentication
let auth = null;

// Firebase Cloud Messaging
let messaging = null;

// ServerValue (timestamps) - use a function to get current timestamp
const getTimestamp = () => new Date().toISOString();

// If Firebase initialized, wire real services; otherwise create lightweight in-memory mocks
if (firebaseApp) {
  db = admin.database();
  firestore = admin.firestore();
  auth = admin.auth();
  messaging = admin.messaging();
} else {
  // Simple in-memory mock DB for local development/testing when Firebase credentials are missing
  console.log('ℹ️ Using in-memory mock database (development mode)');
  const store = {};

  function getNode(path) {
    const parts = String(path).split('/').filter(Boolean);
    let node = store;
    for (const p of parts) {
      if (!node[p]) node[p] = {};
      node = node[p];
    }
    return node;
  }

  db = {
    ref(path) {
      return {
        async set(value) {
          // overwrite at path
          const parts = String(path).split('/').filter(Boolean);
          let node = store;
          for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!node[p]) node[p] = {};
            node = node[p];
          }
          node[parts[parts.length - 1]] = value;
          return Promise.resolve();
        },
        async update(value) {
          const parts = String(path).split('/').filter(Boolean);
          let node = store;
          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (!node[p]) node[p] = {};
            if (i === parts.length - 1) {
              node[p] = { ...node[p], ...value };
            } else {
              node = node[p];
            }
          }
          return Promise.resolve();
        },
        async once(event) {
          const parts = String(path).split('/').filter(Boolean);
          let node = store;
          for (const p of parts) {
            if (node[p] === undefined) {
              return Promise.resolve({ val: () => null });
            }
            node = node[p];
          }
          return Promise.resolve({ val: () => node });
        }
      };
    }
  };

  // Mocks for optional services
  firestore = null;
  auth = null;
  messaging = {
    async send(payload) {
      console.log('MOCK messaging.send', payload);
      return Promise.resolve({ success: true });
    },
    async sendMulticast(payload) {
      console.log('MOCK messaging.sendMulticast', payload);
      return Promise.resolve({ successCount: payload.tokens?.length || 0, failureCount: 0 });
    }
  };
}

// Database operations
export const dbOperations = {
  // Users
  async createUser(userId, userData) {
    try {
      await db.ref(`users/${userId}`).set({
        ...userData,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
      });
      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const snapshot = await db.ref(`users/${userId}`).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async updateUser(userId, updates) {
    try {
      updates.updatedAt = getTimestamp();
      await db.ref(`users/${userId}`).update(updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Disaster Requests
  async createDisasterRequest(requestData) {
    try {
      const requestId = Date.now().toString();
      await db.ref(`disasterRequests/${requestId}`).set({
        ...requestData,
        createdAt: getTimestamp(),
        status: 'open'
      });
      return { success: true, requestId };
    } catch (error) {
      console.error('Error creating disaster request:', error);
      throw error;
    }
  },

  async getDisasterRequests(filters = {}) {
    try {
      const snapshot = await db.ref('disasterRequests').once('value');
      let requests = snapshot.val() || {};
      
      // Convert to array and filter
      let requestsArray = Object.entries(requests).map(([id, data]) => ({
        id,
        ...data
      }));

      // Filter by status if provided
      if (filters.status) {
        requestsArray = requestsArray.filter(r => r.status === filters.status);
      }

      // Filter by urgency if provided
      if (filters.minUrgency) {
        requestsArray = requestsArray.filter(r => (r.urgency || 0) >= filters.minUrgency);
      }

      return requestsArray;
    } catch (error) {
      console.error('Error getting disaster requests:', error);
      throw error;
    }
  },

  async updateDisasterRequest(requestId, updates) {
    try {
      updates.updatedAt = getTimestamp();
      await db.ref(`disasterRequests/${requestId}`).update(updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating disaster request:', error);
      throw error;
    }
  },

  // Volunteers
  async registerVolunteer(volunteerId, volunteerData) {
    try {
      await db.ref(`volunteers/${volunteerId}`).set({
        ...volunteerData,
        createdAt: getTimestamp(),
        available: true,
        currentLocation: null
      });
      return { success: true, volunteerId };
    } catch (error) {
      console.error('Error registering volunteer:', error);
      throw error;
    }
  },

  async getVolunteersNearby(lat, lng, radiusKm = 5) {
    try {
      const snapshot = await db.ref('volunteers').once('value');
      const volunteers = snapshot.val() || {};

      return Object.entries(volunteers)
        .map(([id, data]) => ({
          id,
          ...data
        }))
        .filter(v => v.available && v.currentLocation)
        .filter(v => {
          const distance = calculateDistance(
            lat,
            lng,
            v.currentLocation.lat,
            v.currentLocation.lng
          );
          return distance <= radiusKm;
        })
        .sort((a, b) => {
          const distA = calculateDistance(lat, lng, a.currentLocation.lat, a.currentLocation.lng);
          const distB = calculateDistance(lat, lng, b.currentLocation.lat, b.currentLocation.lng);
          return distA - distB;
        });
    } catch (error) {
      console.error('Error getting nearby volunteers:', error);
      throw error;
    }
  },

  async updateVolunteerLocation(volunteerId, lat, lng) {
    try {
      await db.ref(`volunteers/${volunteerId}`).update({
        currentLocation: { lat, lng },
        lastLocationUpdate: getTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating volunteer location:', error);
      throw error;
    }
  },

  // Assignments
  async createAssignment(assignmentData) {
    try {
      const assignmentId = Date.now().toString();
      await db.ref(`assignments/${assignmentId}`).set({
        ...assignmentData,
        createdAt: getTimestamp(),
        status: 'assigned'
      });
      return { success: true, assignmentId };
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  async getVolunteerAssignments(volunteerId) {
    try {
      const snapshot = await db.ref('assignments').once('value');
      const assignments = snapshot.val() || {};

      return Object.entries(assignments)
        .map(([id, data]) => ({
          id,
          ...data
        }))
        .filter(a => a.volunteerId === volunteerId && a.status !== 'completed');
    } catch (error) {
      console.error('Error getting volunteer assignments:', error);
      throw error;
    }
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Push notification service
export const notificationService = {
  async sendToUser(userId, title, body, data = {}) {
    try {
      const user = await dbOperations.getUser(userId);
      if (user?.deviceToken) {
        await messaging.send({
          token: user.deviceToken,
          notification: {
            title,
            body
          },
          data
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  async sendMulticast(tokens, title, body, data = {}) {
    try {
      if (tokens.length === 0) return { success: true, successCount: 0 };
      
      const response = await messaging.sendMulticast({
        tokens,
        notification: {
          title,
          body
        },
        data
      });
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }
};

export { db, firestore, auth, messaging };
