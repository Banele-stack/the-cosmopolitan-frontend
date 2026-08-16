import { create } from "zustand";
import { PriceRange } from "@/features/business/types";

interface BusinessSearchStore {
  location: string;

  lat: number | null;
  lng: number | null;

  categorySlug: string;
  subcategorySlug: string;

  // Display names for the slugs above — kept alongside them so the
  // "{Category} Businesses" heading (see formatCategoryHeading) doesn't
  // need its own category fetch just to turn a slug back into a label.
  categoryName: string;
  subcategoryName: string;

  search: string;

  openNow: boolean;
  deliveryAvailable: boolean;
  onlineOnly: boolean;
  nearby: boolean;
  highlyRated: boolean;
  priceRange: PriceRange | "";

  searchTrigger: number;

  setLocation: (location: string) => void;

  setCoordinates: (lat: number, lng: number) => void;

  setCategorySlug: (categorySlug: string, categoryName?: string) => void;

  setSubcategorySlug: (
    subcategorySlug: string,
    subcategoryName?: string
  ) => void;

  setSearch: (search: string) => void;

  toggleOpenNow: () => void;
  toggleDeliveryAvailable: () => void;
  toggleOnlineOnly: () => void;
  toggleNearby: () => void;
  toggleHighlyRated: () => void;

  setPriceRange: (priceRange: PriceRange | "") => void;

  triggerSearch: () => void;

  clearFilters: () => void;
}

export const useBusinessSearchStore =
  create<BusinessSearchStore>((set) => ({
    // Empty means "Near Me"
    location: "",

    lat: null,
    lng: null,

    categorySlug: "",
    subcategorySlug: "",
    categoryName: "",
    subcategoryName: "",

    search: "",

    openNow: false,
    deliveryAvailable: false,
    onlineOnly: false,
    nearby: false,
    highlyRated: false,
    priceRange: "",

    searchTrigger: 0,

    setLocation: (location) => set({ location }),

    setCoordinates: (lat, lng) =>
      set({
        lat,
        lng,
      }),

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

    setSearch: (search) => set({ search }),

    toggleOpenNow: () =>
      set((state) => ({ openNow: !state.openNow })),

    toggleDeliveryAvailable: () =>
      set((state) => ({
        deliveryAvailable: !state.deliveryAvailable,
      })),

    toggleOnlineOnly: () =>
      set((state) => ({ onlineOnly: !state.onlineOnly })),

    toggleNearby: () =>
      set((state) => ({ nearby: !state.nearby })),

    toggleHighlyRated: () =>
      set((state) => ({ highlyRated: !state.highlyRated })),

    setPriceRange: (priceRange) => set({ priceRange }),

    triggerSearch: () =>
      set((state) => ({
        searchTrigger: state.searchTrigger + 1,
      })),

    clearFilters: () =>
      set((state) => ({
        location: "",
        categorySlug: "",
        subcategorySlug: "",
        categoryName: "",
        subcategoryName: "",
        search: "",
        openNow: false,
        deliveryAvailable: false,
        onlineOnly: false,
        nearby: false,
        highlyRated: false,
        priceRange: "",
        searchTrigger: state.searchTrigger + 1,
      })),
  }));
