import React, { useState, useEffect } from 'react';
import { useAuthStore, useDisasterStore, useMapStore } from '../store';
import DisasterMap from '../components/DisasterMap';
import ReportDisaster from '../components/ReportDisaster';
import { disasterService, volunteerService } from '../services/api';

export default function VictimDashboard() {
  const { user } = useAuthStore();
  const { requests, setRequests, nearbyRequests, setNearbyRequests } = useDisasterStore();
  const { center, setCenter } = useMapStore();
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(center);
  const [showReportForm, setShowReportForm] = useState(false);
  const [nearbyVolunteers, setNearbyVolunteers] = useState([]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setCenter(newLocation);
      });
    }
  }, []);

  // Fetch nearby requests
  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      fetchNearbyRequests();
      fetchNearbyVolunteers();
      const interval = setInterval(() => {
        fetchNearbyRequests();
        fetchNearbyVolunteers();
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  const fetchNearbyRequests = async () => {
    try {
      const response = await disasterService.getNearbyRequests(userLocation.lat, userLocation.lng, 10);
      // axios wraps response in .data, so response.data is { count, radius, requests }
      setNearbyRequests(response.data?.requests || []);
    } catch (error) {
      console.error('Error fetching nearby requests:', error);
    }
  };

  const fetchNearbyVolunteers = async () => {
    try {
      const response = await volunteerService.getNearbyVolunteers(userLocation.lat, userLocation.lng, 10);
      // Response should be { count, radius, volunteers }
      setNearbyVolunteers(response.data?.volunteers || []);
    } catch (error) {
      console.error('Error fetching nearby volunteers:', error);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100vh', padding: '20px' }}>
      {/* Left Panel */}
      <div style={{ overflow: 'auto', borderRight: '1px solid #ddd' }}>
        <h2>🆘 Disaster Victim Dashboard</h2>
        <p>Hello, <strong>{user?.name}</strong></p>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#FF0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            {showReportForm ? '✕ Close' : '🆘 Report Emergency'}
          </button>
        </div>

        {showReportForm && <ReportDisaster />}

        <h3>👨‍🚒 Available Volunteers Nearby ({nearbyVolunteers.length})</h3>
        {nearbyVolunteers.length === 0 ? (
          <p style={{ color: '#999' }}>⏳ No volunteers available in your area right now</p>
        ) : (
          <div>
            {nearbyVolunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  border: '2px solid #4CAF50',
                  borderRadius: '4px',
                  backgroundColor: '#e8f5e9'
                }}
              >
                <h4 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>✓ {volunteer.name}</h4>
                <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>
                  📞 {volunteer.phone || 'N/A'} | 🎯 Expertise: {(volunteer.expertise || []).join(', ') || 'General'}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#666' }}>
                  ⭐ Rating: {volunteer.rating || 0}/5 | ✅ Completed: {volunteer.completedAssignments || 0}
                </p>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ marginTop: '20px' }}>📍 Other Emergency Requests ({nearbyRequests.length})</h3>
        {nearbyRequests.length === 0 ? (
          <p style={{ color: '#999' }}>No other emergencies in your area</p>
        ) : (
          <div>
            {nearbyRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #FF9800',
                  borderRadius: '4px',
                  backgroundColor: '#fff3e0'
                }}
              >
                <h4 style={{ margin: '0 0 5px 0' }}>{request.type}</h4>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  👤 {request.peopleAffected} affected | 🚑 {request.injuryLevel}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Map */}
      <div style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <DisasterMap
          requests={nearbyRequests}
          volunteers={nearbyVolunteers}
          showVolunteers={true}
          highlightLatest={true}
          onMarkerClick={(marker) => {
            console.log('Selected:', marker);
          }}
        />
      </div>
    </div>
  );
}
