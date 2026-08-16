import { BusinessCategory, BusinessSubcategory } from "@/features/business/types";

export type GigType = "need_help" | "offering_work";
export type GigUrgency = "today" | "this_week" | "flexible";
export type GigPriceType = "fixed" | "hourly" | "negotiable";
export type GigStatus = "active" | "filled" | "expired" | "pending_review";

export interface GigLocation {
  address: string;
  area: string;
  lat: number;
  lng: number;
}

export interface Gig {
  id: number;
  type: GigType;
  title: string;
  description: string;
  category: BusinessCategory | null;
  subcategory: BusinessSubcategory | null;
  price: number | null;
  priceType: GigPriceType;
  urgency: GigUrgency;
  expiresAt: string;
  location: GigLocation;
  whatsappNumber: string;
  status: GigStatus;
  createdAt: string;
  ownerId?: number;
  ownerVerified?: boolean;
  ownerTiktokUrl?: string;
  ownerSocialUrl?: string;
  viewCount?: number;
  contactClickCount?: number;
}

export interface CreateGigDto {
  type: GigType;
  title: string;
  description: string;
  categorySlug?: string;
  subcategorySlug?: string;
  price?: number;
  priceType?: GigPriceType;
  urgency: GigUrgency;
  location: {
    address: string;
    area: string;
    lat: number;
    lng: number;
  };
  whatsappNumber: string;
}

export interface GigFilters {
  type?: GigType;
  categorySlug?: string;
  subcategorySlug?: string;
  urgency?: GigUrgency;
  location?: string;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}
