import { create } from "zustand";
import { GigType, GigUrgency } from "@/features/gigs/types";

interface GigSearchStore {
  location: string;

  lat: number | null;
  lng: number | null;

  type: GigType | "";
  categorySlug: string;
  subcategorySlug: string;
  urgency: GigUrgency | "";

  searchTrigger: number;

  setLocation: (location: string) => void;

  setCoordinates: (lat: number, lng: number) => void;

  setType: (type: GigType | "") => void;

  setCategorySlug: (categorySlug: string) => void;

  setSubcategorySlug: (subcategorySlug: string) => void;

  setUrgency: (urgency: GigUrgency | "") => void;

  triggerSearch: () => void;

  clearFilters: () => void;
}

export const useGigSearchStore = create<GigSearchStore>((set) => ({
  // Empty means "Near Me"
  location: "",

  lat: null,
  lng: null,

  type: "",
  categorySlug: "",
  subcategorySlug: "",
  urgency: "",

  searchTrigger: 0,

  setLocation: (location) => set({ location }),

  setCoordinates: (lat, lng) => set({ lat, lng }),

  setType: (type) => set({ type }),

  setCategorySlug: (categorySlug) =>
    set({
      categorySlug,
      // Selecting a new top-level category invalidates whatever
      // subcategory was previously chosen under the old category.
      subcategorySlug: "",
    }),

  setSubcategorySlug: (subcategorySlug) => set({ subcategorySlug }),

  setUrgency: (urgency) => set({ urgency }),

  triggerSearch: () =>
    set((state) => ({
      searchTrigger: state.searchTrigger + 1,
    })),

  clearFilters: () =>
    set((state) => ({
      location: "",
      type: "",
      categorySlug: "",
      subcategorySlug: "",
      urgency: "",
      searchTrigger: state.searchTrigger + 1,
    })),
}));
