import React, { useState, useEffect } from 'react';
import { aiService } from '../services/api';

export default function CoordinatorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboard();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboard, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboard = async () => {
    try {
      const response = await aiService.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>👨‍💼 Disaster Coordinator Dashboard</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh every 5 seconds
        </label>
      </div>

      {dashboard && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: '#FFEBEE', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>🚨 Critical</h3>
              <p style={{ fontSize: '32px', margin: '0', color: '#E53935' }}>{dashboard.criticalCount || 0}</p>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#FFF3E0', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>⚠️ High Priority</h3>
              <p style={{ fontSize: '32px', margin: '0', color: '#FB8C00' }}>{dashboard.highCount || 0}</p>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#E6E6E6', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>📊 Total Requests</h3>
              <p style={{ fontSize: '32px', margin: '0', color: '#333' }}>{dashboard.totalRequests || 0}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: '#E8F5E9', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>🟢 Active Volunteers</h3>
              <p style={{ fontSize: '32px', margin: '0', color: '#43A047' }}>
                {dashboard.volunteersActiveCount || 0}
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>🚑 In-Progress Assignments</h3>
              {dashboard.assignmentsInProgress && dashboard.assignmentsInProgress.length > 0 ? (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {dashboard.assignmentsInProgress.map((a) => (
                    <div
                      key={a.assignmentId}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{a.volunteerName || a.volunteerId}</strong>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          Assignment: {a.assignmentId?.substring(0, 8)} • Request: {a.requestId?.substring(0, 8)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px' }}>
                          xyx: {a.eta?.durationMinutes ?? '—'} min
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ABC: {a.eta?.distanceKm?.toFixed(2) ?? '—'} km
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No active assignments.</p>
              )}
            </div>
          </div>

          <h3>AI Aggregated Requests</h3>
          {dashboard.aggregated && dashboard.aggregated.length > 0 ? (
            <div>
              {dashboard.aggregated.map((cluster, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    border: `3px solid ${getPriorityColor(cluster.priority)}`,
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>
                        {cluster.priority} Priority - Urgency: {cluster.urgencyScore}/10
                      </h4>
                      <p style={{ margin: '5px 0', color: '#666' }}>{cluster.combinedDescription}</p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Estimated Victims:</strong> {cluster.estimatedVictimsCount}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Location:</strong> ({cluster.centroidLocation.lat.toFixed(4)}, {cluster.centroidLocation.lng.toFixed(4)})
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Recommended Action:</strong> {cluster.recommendedAction}
                      </p>
                      {cluster.requiredResources && cluster.requiredResources.length > 0 && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Resources Needed:</strong> {cluster.requiredResources.join(', ')}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button
                        style={{
                          padding: '10px 15px',
                          backgroundColor: getPriorityColor(cluster.priority),
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        📍 Dispatch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No requests to display</p>
          )}

          {dashboard.summary && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <h4>AI Summary</h4>
              <p>{dashboard.summary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'CRITICAL':
      return '#E53935';
    case 'HIGH':
      return '#FB8C00';
    case 'MEDIUM':
      return '#FDD835';
    case 'LOW':
      return '#81C784';
    default:
      return '#999999';
  }
}
