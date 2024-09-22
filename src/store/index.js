/* eslint-disable no-unused-vars */
import { create } from "zustand";

export const useMapDataStore = create((set) => ({
  areas: [],
  users: {},
  setAreas: (areas) => set((state) => ({ areas })),
  setUsers: (usersGeoJson) => set((state) => ({ users: usersGeoJson })),
  addUsers: (usersGeoJson, userSourceId, userLayerId) =>
    set((state) => {
      const oldFeatures = state.users?.features || [];
      const newFeatures = usersGeoJson?.features || [];
      const allFeatures = [...oldFeatures, ...newFeatures];
      const newUsers = {
        [userSourceId]: {
          ...usersGeoJson,
          userLayerId,
        },
      };

      return { users: { ...state.users, ...newUsers } };
    }),
}));

// export const mapBoxStore = create((set) => ({
//   mapInstance: null,
//   setMapInstance: (mapInstance) => set((state) => ({ mapInstance })),
// }));
