import { create } from "zustand";

interface RoomSearchStore {
  location: string;

  lat: number | null;
  lng: number | null;

  priceRange: string;

  activeTags: string[];

  searchTrigger: number;

  setLocation: (location: string) => void;

  setCoordinates: (lat: number, lng: number) => void;

  setPriceRange: (priceRange: string) => void;

  toggleTag: (tag: string) => void;

  triggerSearch: () => void;

  clearFilters: () => void;
}

export const useRoomSearchStore = create<RoomSearchStore>((set) => ({
  // Empty means "Near Me"
  location: "",

  lat: null,
  lng: null,

  priceRange: "",

  activeTags: [],

  searchTrigger: 0,

  setLocation: (location) => set({ location }),

  setCoordinates: (lat, lng) =>
    set({
      lat,
      lng,
    }),

  setPriceRange: (priceRange) =>
    set({
      priceRange,
    }),

  toggleTag: (tag) =>
    set((state) => ({
      activeTags: state.activeTags.includes(tag)
        ? state.activeTags.filter((t) => t !== tag)
        : [...state.activeTags, tag],
    })),

  triggerSearch: () =>
    set((state) => ({
      searchTrigger: state.searchTrigger + 1,
    })),

  clearFilters: () =>
    set((state) => ({
      location: "",
      priceRange: "",
      activeTags: [],
      searchTrigger: state.searchTrigger + 1,
    })),
}));