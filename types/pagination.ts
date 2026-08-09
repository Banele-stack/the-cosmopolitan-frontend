export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type NearbyMeta = {
  radiusKm: number | null;
  expanded: boolean;
};

export type Paginated<T> = {
  data: T[];
  pagination: PaginationMeta;
  // Present only when results were sorted/filtered by GPS proximity — see
  // NearbyMeta above.
  nearby?: NearbyMeta;
};
