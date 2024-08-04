/* eslint-disable no-unused-vars */
import { create } from "zustand";

export const useMapDataStore = create((set) => ({
  areas: [],
  users: [],
  setAreas: (areas) => set((state) => ({ areas })),
  setUsers: (users) => set((state) => ({ users })),
}));
