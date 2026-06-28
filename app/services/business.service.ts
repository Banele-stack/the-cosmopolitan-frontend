const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Business {
  id: number;
  externalId: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    area: string;
    lat: number;
    lng: number;
  };
  description: string;
  images: string[];
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export async function getBusinesses(): Promise<Business[]> {
  const response = await fetch(`${API_URL}/business`);

  if (!response.ok) {
    throw new Error("Failed to fetch businesses");
  }

  return response.json();
}

export async function getBusiness(id: number): Promise<Business> {
  const response = await fetch(`${API_URL}/business/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch business");
  }

  return response.json();
}