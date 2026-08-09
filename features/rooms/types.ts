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
  bathrooms: number;
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
  availableFrom: string;
  deposit: number;
  leaseTerm: string;

  reportCount: number;
  reviews: Review[];

  ownerId?: number;
  ownerVerified?: boolean;
  viewCount?: number;
  contactClickCount?: number;
};
