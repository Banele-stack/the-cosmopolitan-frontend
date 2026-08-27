export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};


export type Room = {
  id: string;
  name: string;
  category: string;

  rating: number;
  reviewCount: number;

  location: {
    address: string;
    area: string;
    lat?: number;
    lng?: number;
  };

  price: number;

  images: string[];
  videos?: string[];

  description: string;

  phoneNumber: string | null;
  whatsappNumber: string | null;

  bedrooms: number;
  // Nullable — real listings sourced from a landlord's own published info
  // (rather than the self-serve create form) don't always state these; the
  // UI falls back to "Contact landlord for details" rather than requiring
  // them. See room.entity.ts.
  bathrooms: number | null;
  size: number | null;

  furnished: boolean;
  wifi: boolean;
  parking: boolean;
  electricityIncluded: boolean;
  waterIncluded: boolean;
  petsAllowed: boolean;

  // Flexible features
  kitchen?: boolean;
  kitchenType?: string;

  diningArea?: boolean;
  livingRoom?: boolean;
  balcony?: boolean;

  security?: string;
  parkingType?: string;
  internetSpeed?: string;

  smokingAllowed?: boolean;
  noiseRule?: string;

  propertyType: string;
  availableFrom: string | null;
  deposit: number | null;
  leaseTerm: string | null;

  reportCount: number;
  reviews: Review[];

  ownerId?: number;
  ownerVerified?: boolean;
  ownerTiktokUrl?: string;
  ownerSocialUrl?: string;
  viewCount?: number;
  contactClickCount?: number;
};
