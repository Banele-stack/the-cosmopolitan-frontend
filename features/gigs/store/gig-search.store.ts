import { create } from "zustand";
import { GigType, GigUrgency } from "@/features/gigs/types";

interface GigSearchStore {
  location: string;

  lat: number | null;
  lng: number | null;

  type: GigType | "";
  categorySlug: string;
  subcategorySlug: string;

  // Display names for the slugs above — kept alongside them so the
  // "{Category} Piece Jobs" heading (see formatCategoryHeading) doesn't
  // need its own category fetch just to turn a slug back into a label.
  categoryName: string;
  subcategoryName: string;

  urgency: GigUrgency | "";

  searchTrigger: number;

  setLocation: (location: string) => void;

  setCoordinates: (lat: number, lng: number) => void;

  setType: (type: GigType | "") => void;

  setCategorySlug: (categorySlug: string, categoryName?: string) => void;

  setSubcategorySlug: (
    subcategorySlug: string,
    subcategoryName?: string
  ) => void;

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
  categoryName: "",
  subcategoryName: "",
  urgency: "",

  searchTrigger: 0,

  setLocation: (location) => set({ location }),

  setCoordinates: (lat, lng) => set({ lat, lng }),

  setType: (type) => set({ type }),

  setCategorySlug: (categorySlug, categoryName = "") =>
    set({
      categorySlug,
      categoryName,
      // Selecting a new top-level category invalidates whatever
      // subcategory was previously chosen under the old category.
      subcategorySlug: "",
      subcategoryName: "",
    }),

  setSubcategorySlug: (subcategorySlug, subcategoryName = "") =>
    set({ subcategorySlug, subcategoryName }),

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
      categoryName: "",
      subcategoryName: "",
      urgency: "",
      searchTrigger: state.searchTrigger + 1,
    })),
}));
