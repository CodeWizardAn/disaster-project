import React, { useState } from 'react';
import { useAuthStore } from './store';
import LoginRegister from './pages/LoginRegister';
import VictimDashboard from './pages/VictimDashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import VolunteerAssignmentsNew from './components/VolunteerAssignmentsNew';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import LiveDashboard from './components/LiveDashboard';

function App() {
  const { user, userType, logout } = useAuthStore();
  const [showNewAssignments, setShowNewAssignments] = useState(false);
  const [showLiveDashboard, setShowLiveDashboard] = useState(false);

  // If not logged in, show login page
  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <LoginRegister />
      </div>
    );
  }

  // If logged in, show appropriate dashboard
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F5F7FA 0%, #E2E6EC 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(90deg, #0D47A1 0%, #1976D2 50%, #1E88E5 100%)',
        color: 'white',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 6px 20px rgba(13, 71, 161, 0.3)'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0', fontSize: '24px' }}>🚨 Disaster Alert & Rescue Coordinator</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#aaa' }}>
            Real-time Emergency Response System | User: {user?.email} ({userType})
          </p>
        </div>
        
        {/* View Selector Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {userType === 'volunteer' && (
            <>
              <button
                onClick={() => setShowNewAssignments(false)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: !showNewAssignments ? '#2E7D32' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Classic View
              </button>
              <button
                onClick={() => setShowNewAssignments(true)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: showNewAssignments ? '#2E7D32' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🎯 Assignments
              </button>
            </>
          )}
          
          {userType === 'coordinator' && (
            <>
              <button
                onClick={() => setShowLiveDashboard(false)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: !showLiveDashboard ? '#1565C0' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                👥 Coordinator
              </button>
              <button
                onClick={() => setShowLiveDashboard(true)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: showLiveDashboard ? '#1565C0' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📊 Live Stats
              </button>
            </>
          )}
        </div>

        <button
          onClick={logout}
          style={{
            padding: '10px 16px',
            backgroundColor: '#E53935',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🚪 Logout
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        {userType === 'victim' && <VictimDashboard />}
        
        {userType === 'volunteer' && (
          showNewAssignments ? <VolunteerAssignmentsNew /> : <VolunteerDashboard />
        )}
        
        {userType === 'coordinator' && (
          showLiveDashboard ? <LiveDashboard /> : <CoordinatorDashboard />
        )}
        
        {!userType && <div>Loading dashboard...</div>}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#f0f0f0',
        padding: '20px',
        textAlign: 'center',
        marginTop: '20px',
        borderTop: '1px solid #ddd'
      }}>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          © 2024 Disaster Alert & Rescue Coordinator | Real-time Emergency Response
        </p>
      </footer>
    </div>
  );
}

export default App;
