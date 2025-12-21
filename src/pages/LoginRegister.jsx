import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { userService } from '../services/api';

export default function LoginRegister() {
  const { setUser, setUserType } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'victim'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userService.register({
        ...formData,
        deviceToken: 'demo-token-' + Math.random().toString(36).substr(2, 9)
      });

      const user = {
        id: response.data.userId,
        ...formData
      };

      setUser(user);
      setUserType(formData.userType);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h2>{isRegistering ? '📝 Register' : '👤 Login/Register'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Name</strong>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Email</strong>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>Phone</strong>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <strong>I am a:</strong>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            >
              <option value="victim">Disaster Victim (need help)</option>
              <option value="volunteer">Volunteer (provide help)</option>
              <option value="coordinator">Coordinator (manage operations)</option>
            </select>
          </label>
        </div>

        {error && <p style={{ color: '#FF0000', marginBottom: '15px' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#0066CC',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Processing...' : '✓ Get Started'}
        </button>
      </form>
    </div>
  );
}
