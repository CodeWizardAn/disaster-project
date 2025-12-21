import React, { useState, useEffect } from 'react';
import { volunteerService, disasterService, aiService } from '../services/api';
import { useAuthStore } from '../store';

export default function VolunteerAssignments() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Get user location and fetch nearby requests
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback location
          setCurrentLocation({ lat: 20.5937, lng: 78.9629 });
        }
      );
    }
  }, []);

  // Fetch nearby requests when on duty
  useEffect(() => {
    if (isOnDuty && currentLocation && user?.id) {
      fetchNearbyRequests();
      const interval = setInterval(fetchNearbyRequests, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOnDuty, currentLocation, user?.id]);

  const fetchNearbyRequests = async () => {
    try {
      const response = await disasterService.getNearbyRequests(
        currentLocation.lat,
        currentLocation.lng,
        10 // 10km radius
      );
      // response.data has { count, radius, requests }
      setNearbyRequests(response.data?.requests || []);
    } catch (error) {
      console.error('Error fetching nearby requests:', error);
    }
  };

  const toggleDuty = async () => {
    setLoading(true);
    try {
      await volunteerService.updateAvailability(user.id, !isOnDuty);
      setIsOnDuty(!isOnDuty);
      setStatus(
        !isOnDuty
          ? '✅ You are now on duty! Accepting requests...'
          : '✅ You are now off duty.'
      );
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    setLoading(true);
    try {
      // Create assignment via AI match
      const matchRes = await aiService.matchVolunteer(requestId, user.id);
      const assignmentId = matchRes.data.assignmentId;
      const eta = matchRes.data.eta;

      // Accept the assignment
      await volunteerService.acceptAssignment(user.id, assignmentId);
      setStatus(
        `✅ Assignment accepted! xyx ~ ${eta?.durationMinutes ?? '—'} min, ABC ~ ${eta?.distanceKm ?? '—'} km`
      );
      fetchNearbyRequests(); // Refresh list
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`❌ Error accepting assignment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const completeRequest = async (requestId) => {
    setLoading(true);
    try {
      await volunteerService.completeAssignment(user.id, requestId, {
        completedAt: new Date().toISOString(),
        notes: 'Assignment completed',
      });
      setStatus('✅ Assignment marked as complete!');
      fetchNearbyRequests();
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🚑 Volunteer Mission Control</h2>

      {/* Duty Toggle */}
      <div
        style={{
          padding: '20px',
          backgroundColor: isOnDuty ? '#e8f5e9' : '#ffebee',
          border: `2px solid ${isOnDuty ? '#4CAF50' : '#f44336'}`,
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Status: {isOnDuty ? '🟢 ON DUTY' : '🔴 OFF DUTY'}
        </p>
        <button
          onClick={toggleDuty}
          disabled={loading}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isOnDuty ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Updating...' : isOnDuty ? '🔴 End Duty' : '🟢 Start Duty'}
        </button>
        {currentLocation && (
          <p style={{ margin: '15px 0 0 0', fontSize: '12px', color: '#666' }}>
            📍 Your location: {currentLocation.lat?.toFixed(4)}, {currentLocation.lng?.toFixed(4)}
          </p>
        )}
      </div>

      {status && (
        <p
          style={{
            padding: '15px',
            backgroundColor: status.includes('❌') ? '#ffebee' : '#e8f5e9',
            color: status.includes('❌') ? '#c62828' : '#2e7d32',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {status}
        </p>
      )}

      {/* Nearby Requests */}
      {isOnDuty && (
        <div>
          <h3>🚨 Nearby Emergency Requests ({nearbyRequests.length})</h3>
          {nearbyRequests.length === 0 ? (
            <p style={{ color: '#666' }}>No nearby requests at the moment.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {nearbyRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => acceptRequest(request.id)}
                  onComplete={() => completeRequest(request.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!isOnDuty && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          <p>👋 Go on duty to see nearby emergency requests and accept assignments!</p>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onAccept, onComplete }) {
  const urgency = request.urgency || 5;
  const priorityColor = urgency > 8 ? '#E53935' : urgency > 5 ? '#FB8C00' : '#FDD835';

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#fff',
        border: `3px solid ${priorityColor}`,
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 10px 0', color: priorityColor }}>
            {request.type || 'Unknown'} Emergency
          </h4>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>{request.description || 'No description'}</p>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
            <p style={{ margin: '3px 0' }}>👥 People affected: {request.peopleAffected || 1}</p>
            <p style={{ margin: '3px 0' }}>🏥 Injury level: {request.injuryLevel || 'unknown'}</p>
            <p style={{ margin: '3px 0' }}>
              📍 ({request.latitude?.toFixed(4)}, {request.longitude?.toFixed(4)})
            </p>
          </div>
        </div>
        <div style={{ marginLeft: '15px', minWidth: '120px' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: priorityColor,
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            {urgency}/10
          </div>
          <button
            onClick={onAccept}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✅ Accept
          </button>
          <button
            onClick={onComplete}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0066CC',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✓ Complete
          </button>
        </div>
      </div>
    </div>
  );
}
