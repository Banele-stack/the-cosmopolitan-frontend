export type BusinessType = "physical" | "online";

export type PriceRange = "$" | "$$" | "$$$" | "$$$$";

export interface BusinessSubcategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface BusinessCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  subcategories: BusinessSubcategory[];
}

export interface Business {
  id: number;
  externalId: string;
  name: string;
  // Self-declared qualification/credential trust signal, e.g. "BCom
  // Accounting Graduate" — unverified, shown as a badge on the listing.
  credential?: string | null;
  category: BusinessCategory;
  subcategory: BusinessCategory["subcategories"][number] | null;
  businessType: BusinessType;
  rating: number;
  reviewCount: number;

  location: {
    address?: string;
    area?: string;
    lat?: number;
    lng?: number;
  } | null;

  description: string;

  images: string[];
  videos?: string[] | null;

  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  supportsDelivery: boolean;
  supportsWhatsAppOrder: boolean;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  priceRange: PriceRange | null;

  ownerId?: number;
  ownerVerified?: boolean;
  ownerTiktokUrl?: string;
  ownerSocialUrl?: string;
  viewCount?: number;
  contactClickCount?: number;
}

export interface CreateBusinessDto {
  name: string;
  credential?: string;
  categorySlug: string;
  subcategorySlug?: string;
  businessType: BusinessType;
  description: string;

  location?: {
    address?: string;
    area?: string;
    lat?: number;
    lng?: number;
  };

  images?: string[];
  videos?: string[];

  supportsDelivery?: boolean;
  supportsWhatsAppOrder?: boolean;
  whatsappNumber?: string;
  phoneNumber: string;
  priceRange?: PriceRange;
}

export interface BusinessFilters {
  location?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
  openNow?: boolean;
  deliveryAvailable?: boolean;
  onlineOnly?: boolean;
  nearby?: boolean;
  highlyRated?: boolean;
  priceRange?: PriceRange | "";
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}
