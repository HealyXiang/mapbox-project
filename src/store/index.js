/* eslint-disable no-unused-vars */
import { create } from "zustand";

export const useMapDataStore = create((set) => ({
  areas: [],
  users: {},
  setAreas: (areas) => set((state) => ({ areas })),
  setUsers: (usersGeoJson) => set((state) => ({ users: usersGeoJson })),
  addUsers: (usersGeoJson) =>
    set((state) => {
      const oldFeatures = state.users?.features || [];
      const newFeatures = usersGeoJson?.features || [];
      const allFeatures = [...oldFeatures, ...newFeatures];

      return { users: { ...state.users, features: allFeatures } };
    }),
}));

// export const mapBoxStore = create((set) => ({
//   mapInstance: null,
//   setMapInstance: (mapInstance) => set((state) => ({ mapInstance })),
// }));
