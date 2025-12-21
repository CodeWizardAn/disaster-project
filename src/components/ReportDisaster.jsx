import React, { useState } from 'react';
import { disasterService, userService } from '../services/api';
import { useAuthStore, useDisasterStore } from '../store';

export default function ReportDisaster() {
  const { user } = useAuthStore();
  const { addRequest } = useDisasterStore();

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [formData, setFormData] = useState({
    type: 'unknown',
    description: '',
    peopleAffected: 1,
    injuryLevel: 'unknown',
    accessibility: 'unknown'
  });

  // Get user's current location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setStatus('✅ Location obtained');
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default location (center of India)
          setLocation({ lat: 20.5937, lng: 78.9629 });
          setStatus('ℹ️ Using default location (permission denied). You can adjust manually.');
        }
      );
    } else {
      // No geolocation support, use default
      setLocation({ lat: 20.5937, lng: 78.9629 });
      setStatus('ℹ️ Geolocation not supported. Using default location.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      if (!location.lat || !location.lng) {
        throw new Error('Location not available. Please enable geolocation or enter coordinates manually.');
      }

      console.log('Submitting disaster report:', {
        userId: user.id,
        latitude: location.lat,
        longitude: location.lng,
        ...formData
      });

      const response = await disasterService.markUnsafe({
        userId: user.id,
        latitude: location.lat,
        longitude: location.lng,
        ...formData
      });

      console.log('Response:', response);

      setStatus('✅ Disaster request submitted! Volunteers are being notified...');
      if (response.data) {
        addRequest(response.data);
      }

      // Reset form
      setFormData({
        type: 'unknown',
        description: '',
        peopleAffected: 1,
        injuryLevel: 'unknown',
        accessibility: 'unknown'
      });
    } catch (error) {
      console.error('Error submitting:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🆘 Report Disaster/Emergency</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Disaster Type</strong>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            >
              <option>unknown</option>
              <option>building_collapse</option>
              <option>fire</option>
              <option>drowning</option>
              <option>earthquake</option>
              <option>landslide</option>
              <option>flooding</option>
              <option>other</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Description</strong>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the situation..."
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>People Affected</strong>
            <input
              type="number"
              min="1"
              value={formData.peopleAffected}
              onChange={(e) => setFormData({ ...formData, peopleAffected: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Injury Level</strong>
            <select
              value={formData.injuryLevel}
              onChange={(e) => setFormData({ ...formData, injuryLevel: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option>unknown</option>
              <option>critical</option>
              <option>severe</option>
              <option>moderate</option>
              <option>minor</option>
              <option>none</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Accessibility</strong>
            <select
              value={formData.accessibility}
              onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option>unknown</option>
              <option>easily_accessible</option>
              <option>difficult_terrain</option>
              <option>trapped</option>
              <option>underwater</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>
            📍 Location: {location.lat ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Getting location...'}
          </p>
          <details style={{ fontSize: '12px', marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', color: '#0066cc' }}>🔧 Adjust location manually</summary>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Latitude:</strong>
                <input
                  type="number"
                  step="0.0001"
                  value={location.lat || ''}
                  onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: '6px', marginTop: '5px' }}
                />
              </label>
              <label style={{ display: 'block' }}>
                <strong>Longitude:</strong>
                <input
                  type="number"
                  step="0.0001"
                  value={location.lng || ''}
                  onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: '6px', marginTop: '5px' }}
                />
              </label>
            </div>
          </details>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#FF0000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Submitting...' : '📤 Report Emergency'}
        </button>
      </form>

      {status && <p style={{ marginTop: '15px', textAlign: 'center' }}>{status}</p>}
    </div>
  );
}
