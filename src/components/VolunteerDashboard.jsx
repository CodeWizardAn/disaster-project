import React, { useState, useEffect } from 'react';
import { volunteerService, aiService } from '../services/api';
import DisasterMap from './DisasterMap';
import { useAuthStore, useVolunteerStore } from '../store';

export default function VolunteerDashboard() {
  const { user } = useAuthStore();
  const { assignments, setAssignments } = useVolunteerStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isOnDuty, setIsOnDuty] = useState(false);

  // Get volunteer assignments
  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
      // Update location every 10 seconds when on duty
      if (isOnDuty) {
        const locationInterval = setInterval(updateLocation, 10000);
        return () => clearInterval(locationInterval);
      }
    }
  }, [user, isOnDuty]);

  // Auto-refresh assignments to update live ETA
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(fetchAssignments, 15000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchAssignments = async () => {
    try {
      const response = await volunteerService.getAssignments(user.id);
      setAssignments(response.data.activeAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const updateLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await volunteerService.updateLocation(user.id, position.coords.latitude, position.coords.longitude);
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleAcceptAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      await volunteerService.acceptAssignment(user.id, assignmentId);
      setStatus('✅ Assignment accepted!');
      fetchAssignments();
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      await volunteerService.completeAssignment(user.id, assignmentId, {
        victimSafetyStatus: 'safe',
        notes: 'Assignment completed successfully'
      });
      setStatus('✅ Assignment completed!');
      fetchAssignments();
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnDuty = async () => {
    try {
      await volunteerService.updateAvailability(user.id, !isOnDuty);
      setIsOnDuty(!isOnDuty);
      setStatus(isOnDuty ? '✅ Went off duty' : '✅ Now on duty and location sharing active');
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🚑 Volunteer Dashboard</h2>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <button
          onClick={toggleOnDuty}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isOnDuty ? '#FF6347' : '#00B050',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isOnDuty ? '🔴 End Duty' : '🟢 Start Duty'}
        </button>
        <p style={{ marginTop: '10px', color: '#666' }}>
          {isOnDuty ? '📍 You are on duty and sharing your location' : '⭕ You are off duty'}
        </p>
      </div>

      <h3>Active Assignments ({assignments.length})</h3>

      {/* Small map showing victim locations for active assignments */}
      {assignments.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '6px 0' }}>🗺️ Victims Nearby (from your assignments)</h4>
          <div style={{ width: '100%' }}>
            <DisasterMap
              requests={assignments.map(a => ({
                id: a.requestId || a.id,
                location: a.victimLocation ? { lat: a.victimLocation.lat, lng: a.victimLocation.lng } : null,
                disasterType: a.type || 'Assistance',
                description: a.description || a.notes || '',
                urgency: a.urgency || 8,
                createdAt: a.createdAt
              }))}
              showVolunteers={false}
              highlightLatest={true}
              height={300}
            />
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <p style={{ color: '#999' }}>No active assignments. You'll be notified when there are nearby requests.</p>
      ) : (
        <div>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              style={{
                padding: '15px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4>{assignment.description}</h4>
              <p>
                <strong>Type:</strong> {assignment.type}
              </p>
              <p>
                <strong>People Affected:</strong> {assignment.peopleAffected}
              </p>
              <p>
                <strong>Status:</strong> {assignment.status}
              </p>
              <p>
                <strong>ABC:</strong>{' '}
                {(assignment.eta?.distanceKm ?? assignment.distanceKm)?.toFixed(2)} km
              </p>
              <p>
                <strong>xyx:</strong>{' '}
                {assignment.eta?.durationMinutes ?? assignment.estimatedArrivalMinutes} minutes
              </p>
              {assignment.eta?.estimatedArrival && (
                <p>
                  <strong>xyx:</strong> {new Date(assignment.eta.estimatedArrival).toLocaleTimeString()}
                </p>
              )}

              {assignment.status === 'assigned' && (
                <button
                  onClick={() => handleAcceptAssignment(assignment.id)}
                  disabled={loading}
                  style={{
                    padding: '8px 15px',
                    marginRight: '10px',
                    backgroundColor: '#00B050',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  ✅ Accept
                </button>
              )}

              {assignment.status === 'in_progress' && (
                <button
                  onClick={() => handleCompleteAssignment(assignment.id)}
                  disabled={loading}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#0066CC',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  🏁 Complete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {status && (
        <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          {status}
        </p>
      )}
    </div>
  );
}
