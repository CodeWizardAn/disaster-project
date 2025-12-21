import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  userType: null, // 'victim', 'volunteer', 'coordinator'
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setUserType: (userType) => set({ userType }),
  logout: () => set({ user: null, userType: null, isAuthenticated: false })
}));

export const useDisasterStore = create((set) => ({
  requests: [],
  nearbyRequests: [],
  selectedRequest: null,

  setRequests: (requests) => set({ requests }),
  setNearbyRequests: (nearbyRequests) => set({ nearbyRequests }),
  setSelectedRequest: (selectedRequest) => set({ selectedRequest }),
  addRequest: (request) =>
    set((state) => ({ requests: [...state.requests, request] }))
}));

export const useVolunteerStore = create((set) => ({
  volunteers: [],
  assignments: [],
  currentLocation: null,
  isOnDuty: false,

  setVolunteers: (volunteers) => set({ volunteers }),
  setAssignments: (assignments) => set({ assignments }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setOnDuty: (isOnDuty) => set({ isOnDuty })
}));

export const useMapStore = create((set) => ({
  center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
  zoom: 12,
  markers: [],

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setMarkers: (markers) => set({ markers }),
  addMarker: (marker) =>
    set((state) => ({ markers: [...state.markers, marker] }))
}));
