import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDisasterStore } from '../store';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function DisasterMapLeaflet({ volunteers = [], requests = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5); // Default to India

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear previous markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add disaster request markers (red/orange)
    requests.forEach(request => {
      const latRaw = request.location?.lat ?? request.latitude;
      const lngRaw = request.location?.lng ?? request.longitude;
      const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
      const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : lngRaw;
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const severity = request.urgency > 7 ? 'critical' : 'high';
        const color = severity === 'critical' ? '#E53935' : '#FB8C00';

        const marker = L.circleMarker(
          [lat, lng],
          {
            radius: 8,
            fillColor: color,
            color: '#333',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }
        )
          .bindPopup(
            `<div>
              <strong>${request.disasterType || 'Emergency'}</strong><br/>
              <small>${request.description || 'No description'}</small><br/>
              <small>Urgency: ${request.urgency || 0}/10</small>
            </div>`
          )
          .addTo(map.current);

        markers.current.push(marker);
      }
    });

    // Add volunteer markers (blue)
    volunteers.forEach(volunteer => {
      if (volunteer.currentLocation && volunteer.currentLocation.lat && volunteer.currentLocation.lng) {
        const marker = L.circleMarker(
          [volunteer.currentLocation.lat, volunteer.currentLocation.lng],
          {
            radius: 6,
            fillColor: '#1E88E5',
            color: '#333',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7,
          }
        )
          .bindPopup(
            `<div>
              <strong>${volunteer.name || 'Volunteer'}</strong><br/>
              <small>${volunteer.skills || 'No skills listed'}</small>
            </div>`
          )
          .addTo(map.current);

        markers.current.push(marker);
      }
    });

    // Fit map to markers if any exist
    if (markers.current.length > 0) {
      const group = new L.featureGroup(markers.current);
      map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [requests, volunteers]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    />
  );
}
