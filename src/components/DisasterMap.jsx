import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function DisasterMap({ requests = [], volunteers = [], showVolunteers = true, highlightLatest = false, height = 500, onMarkerClick = null }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map once
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear previous markers
    markers.current.forEach(marker => {
      if (marker && map.current) {
        map.current.removeLayer(marker);
      }
    });
    markers.current = [];

    // Add disaster request markers (red/orange for urgency)
    if (requests && Array.isArray(requests)) {
      requests.forEach(request => {
        // Handle both location.lat/lng and direct latitude/longitude formats (including strings)
        const latRaw = request.location?.lat ?? request.latitude;
        const lngRaw = request.location?.lng ?? request.longitude;
        const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
        const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : lngRaw;
        
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          const urgency = request.urgency || 5;
          const color = urgency > 7 ? '#E53935' : '#FB8C00';

          // Use a simple, clear marker for victims to make them easy to spot
          const victimIcon = L.divIcon({
            className: 'victim-div-icon',
            html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.25);border:2px solid white;"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          const marker = L.marker([lat, lng], { icon: victimIcon })
            .bindPopup(
              `<div style="font-size:13px">
                <strong>${request.disasterType || 'Victim'}</strong><br/>
                <small>${request.description || 'Needs help'}</small>
              </div>`
            )
            .addTo(map.current);
          if (onMarkerClick) marker.on('click', () => onMarkerClick(request));

          markers.current.push(marker);
        }
      });
    }

    // Add volunteer markers (blue) only when requested
    if (showVolunteers && volunteers && Array.isArray(volunteers)) {
      volunteers.forEach(volunteer => {
        // Handle both formats: API response { lat, lng } and stored format { currentLocation: { lat, lng } } and strings
        const latRaw = volunteer.location?.lat ?? volunteer.latitude ?? volunteer.currentLocation?.lat;
        const lngRaw = volunteer.location?.lng ?? volunteer.longitude ?? volunteer.currentLocation?.lng;
        const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
        const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : lngRaw;
        
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          const volunteerIcon = L.divIcon({
            className: 'volunteer-div-icon',
            html: `<div style="background:#1E88E5;width:12px;height:12px;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.2);border:2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          });

          const marker = L.marker([lat, lng], { icon: volunteerIcon })
            .bindPopup(
              `<div style="font-size:12px">
                <strong>${volunteer.name || 'Volunteer'}</strong><br/>
                <small>${volunteer.expertise ? volunteer.expertise.join(', ') : (volunteer.skills || 'No skills listed')}</small>
              </div>`
            )
            .addTo(map.current);
          if (onMarkerClick) marker.on('click', () => onMarkerClick(volunteer));

          markers.current.push(marker);
        }
      });
    }

    // If highlightLatest is requested, center on the most recent/high-urgency request
    if (highlightLatest && requests && requests.length > 0 && map.current) {
      // pick request with latest createdAt or highest urgency as fallback
      let pick = null;
      if (requests.some(r => r.createdAt)) {
        pick = requests.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      } else {
        pick = requests.slice().sort((a, b) => (b.urgency || 0) - (a.urgency || 0))[0] || requests[0];
      }

      const lat = pick.location?.lat || pick.latitude || pick.latitude;
      const lng = pick.location?.lng || pick.longitude || pick.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        map.current.setView([lat, lng], 13);
      }
    } else {
      // Fit map to markers if any exist
      if (markers.current.length > 0 && map.current) {
        try {
          const group = new L.featureGroup(markers.current);
          map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        } catch (e) {
          console.warn('Could not fit bounds:', e);
        }
      }
    }

    // Add a small legend for clarity (victims vs volunteers)
    if (map.current && !map.current._legendAdded) {
      const legend = L.control({ position: 'topright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'map-legend');
        div.style.padding = '6px 8px';
        div.style.background = 'rgba(255,255,255,0.9)';
        div.style.borderRadius = '6px';
        div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
        div.innerHTML = `<div style="display:flex;gap:8px;align-items:center;font-size:12px"><div style='width:12px;height:12px;border-radius:50%;background:#ff4d4f;border:2px solid #fff'></div><div>Victim</div><div style='width:12px;height:12px;border-radius:50%;background:steelblue;border:2px solid #fff;margin-left:8px'></div><div>Volunteer</div></div>`;
        return div;
      };
      legend.addTo(map.current);
      map.current._legendAdded = true;
    }
  }, [requests, volunteers]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        marginTop: '10px',
      }}
    />
  );
}
