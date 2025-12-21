import React, { useState, useEffect } from 'react';
import { disasterService, aiService } from '../services/api';
import { useDisasterStore } from '../store';
import DisasterMap from './DisasterMap';

export default function LiveDashboard() {
  const { requests, setRequests } = useDisasterStore();
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    total: 0,
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Fetch open requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await disasterService.getOpenRequests();
      const allRequests = response.data?.requests || [];

      // Calculate statistics
      const critical = allRequests.filter((r) => (r.urgency || 0) > 8).length;
      const high = allRequests.filter((r) => (r.urgency || 0) > 5 && (r.urgency || 0) <= 8).length;
      const medium = allRequests.filter((r) => (r.urgency || 0) <= 5).length;

      setStats({
        critical,
        high,
        medium,
        total: allRequests.length,
      });

      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and set interval
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (filter === 'critical') return (r.urgency || 0) > 8;
    if (filter === 'high') return (r.urgency || 0) > 5 && (r.urgency || 0) <= 8;
    if (filter === 'medium') return (r.urgency || 0) <= 5;
    return true;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Live Disaster Dashboard</h2>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <StatCard
          label="🚨 Critical"
          value={stats.critical}
          color="#E53935"
          onClick={() => setFilter('critical')}
        />
        <StatCard
          label="⚠️ High"
          value={stats.high}
          color="#FB8C00"
          onClick={() => setFilter('high')}
        />
        <StatCard
          label="📋 Medium"
          value={stats.medium}
          color="#FDD835"
          onClick={() => setFilter('medium')}
        />
        <StatCard
          label="📊 Total"
          value={stats.total}
          color="#0066CC"
          onClick={() => setFilter('all')}
        />
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 15px',
            margin: '0 5px 5px 0',
            backgroundColor: filter === 'all' ? '#0066CC' : '#e0e0e0',
            color: filter === 'all' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('critical')}
          style={{
            padding: '8px 15px',
            margin: '0 5px 5px 0',
            backgroundColor: filter === 'critical' ? '#FF0000' : '#e0e0e0',
            color: filter === 'critical' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Critical ({stats.critical})
        </button>
        <button
          onClick={() => setFilter('high')}
          style={{
            padding: '8px 15px',
            margin: '0 5px 5px 0',
            backgroundColor: filter === 'high' ? '#FFA500' : '#e0e0e0',
            color: filter === 'high' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          High ({stats.high})
        </button>
        <button
          onClick={fetchRequests}
          style={{
            padding: '8px 15px',
            margin: '0 5px 5px 0',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Map View */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🗺️ Map View</h3>
        {/* For coordinators we emphasize victims and simplify the view */}
        <DisasterMap requests={filteredRequests} showVolunteers={false} highlightLatest={true} />
      </div>

      {/* Requests List */}
      <div>
        <h3>📋 Request Details</h3>
        {loading ? (
          <p>Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p style={{ color: '#666' }}>No requests found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        border: `3px solid ${color}`,
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>{label}</p>
      <h2 style={{ margin: '0', fontSize: '28px', color: color }}>{value}</h2>
    </div>
  );
}

function RequestCard({ request }) {
  const urgency = request.urgency || 5;
    const priorityColor =
    urgency > 8 ? '#E53935' : urgency > 5 ? '#FB8C00' : '#FDD835';

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#f9f9f9',
        border: `3px solid ${priorityColor}`,
        borderRadius: '8px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0' }}>
            {request.type || 'Unknown'} - {request.id?.substring(0, 8)}
          </h4>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
            {request.description || 'No description'}
          </p>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
            <p style={{ margin: '3px 0' }}>👥 People: {request.peopleAffected || 1}</p>
            <p style={{ margin: '3px 0' }}>🏥 Injury: {request.injuryLevel || 'unknown'}</p>
            <p style={{ margin: '3px 0' }}>📍 ({request.latitude?.toFixed(3)}, {request.longitude?.toFixed(3)})</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: priorityColor,
              marginBottom: '10px',
            }}
          >
            {urgency}/10
          </div>
          <span
            style={{
              padding: '5px 10px',
              backgroundColor: priorityColor,
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {urgency > 8 ? 'CRITICAL' : urgency > 5 ? 'HIGH' : 'MEDIUM'}
          </span>
        </div>
      </div>
    </div>
  );
}
