import { Paginated } from "@/types/pagination";
import {
  Business,
  BusinessCategory,
  BusinessFilters,
  CreateBusinessDto,
} from "@/features/business/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Business/CreateBusinessDto/BusinessFilters now live in ./types alongside
// the rest of this feature's domain types — re-exported here so existing
// `import { Business } from ".../business.service"` call sites keep working.
export type { Business, CreateBusinessDto, BusinessFilters };

export async function getBusinessCategories(): Promise<BusinessCategory[]> {
  const response = await fetch(`${API_URL}/business-categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch business categories");
  }

  return response.json();
}

export async function getBusinesses(
  filters?: BusinessFilters
): Promise<Paginated<Business>> {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams();

  if (filters?.location) {
    params.append("location", filters.location);
  }

  if (filters?.categorySlug) {
    params.append("categorySlug", filters.categorySlug);
  }

  if (filters?.subcategorySlug) {
    params.append("subcategorySlug", filters.subcategorySlug);
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  if (filters?.openNow) {
    params.append("openNow", "true");
  }

  if (filters?.deliveryAvailable) {
    params.append("deliveryAvailable", "true");
  }

  if (filters?.onlineOnly) {
    params.append("onlineOnly", "true");
  }

  if (filters?.nearby) {
    params.append("nearby", "true");
  }

  if (filters?.highlyRated) {
    params.append("highlyRated", "true");
  }

  if (filters?.priceRange) {
    params.append("priceRange", filters.priceRange);
  }

  if (filters?.lat != null) {
    params.append("lat", filters.lat.toString());
  }

  if (filters?.lng != null) {
    params.append("lng", filters.lng.toString());
  }

  if (filters?.page != null) {
    params.append("page", filters.page.toString());
  }

  if (filters?.limit != null) {
    params.append("limit", filters.limit.toString());
  }

  const response = await fetch(
    `${API_URL}/business?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch businesses"
    );
  }

  return result;
}

export async function getBusiness(
  id: number
): Promise<Business> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/business/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch business"
    );
  }

  return result;
}

export async function createBusiness(
  data: CreateBusinessDto
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/business`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create business."
    );
  }

  return result;
}

export async function updateBusiness(
  id: number,
  data: Partial<CreateBusinessDto>
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/business/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update business."
    );
  }

  return result;
}

export async function deleteBusiness(id: number) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/business/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.message || "Failed to delete business."
    );
  }
}
