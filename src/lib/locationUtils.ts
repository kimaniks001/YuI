export interface LocationCondition {
  enabled: boolean;
  locationName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  thresholdMetres: number;
  freshnessMinutes: number | null;
  submitter: string;
  requirePhoto: 'yes' | 'no' | 'optional';
}

export const DEFAULT_LOCATION_CONDITION: LocationCondition = {
  enabled: false,
  locationName: '',
  address: '',
  lat: null,
  lng: null,
  thresholdMetres: 20,
  freshnessMinutes: 20,
  submitter: 'seller',
  requirePhoto: 'yes',
};

export interface LocationEvidence {
  lat: number;
  lng: number;
  capturedAt: string;
  distanceMetres: number | null;
  withinThreshold: boolean | null;
  note?: string;
}

/** Haversine distance between two lat/lng points, returns metres */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export const THRESHOLD_OPTIONS = [
  { value: 10,  label: '10 metres' },
  { value: 20,  label: '20 metres (recommended)' },
  { value: 50,  label: '50 metres' },
  { value: 100, label: '100 metres' },
];

export const FRESHNESS_OPTIONS = [
  { value: 5,    label: 'Within 5 minutes' },
  { value: 10,   label: 'Within 10 minutes' },
  { value: 20,   label: 'Within 20 minutes (recommended)' },
  { value: 60,   label: 'Within 1 hour' },
  { value: 1440, label: 'Same day' },
  { value: null, label: 'No time freshness rule' },
];

export const SUBMITTER_OPTIONS = [
  { value: 'seller',   label: 'Seller / service provider' },
  { value: 'buyer',    label: 'Buyer / customer' },
  { value: 'delivery', label: 'Delivery person' },
  { value: 'inspector',label: 'Inspector' },
  { value: 'approver', label: 'Approver' },
  { value: 'any',      label: 'Any authorized party' },
];

export const LOCATION_TEMPLATES: Record<string, Partial<LocationCondition>> = {
  building_materials: {
    thresholdMetres: 20,
    freshnessMinutes: 20,
    submitter: 'delivery',
    requirePhoto: 'yes',
  },
  fundi: {
    thresholdMetres: 20,
    freshnessMinutes: 20,
    submitter: 'seller',
    requirePhoto: 'optional',
  },
  construction: {
    thresholdMetres: 50,
    freshnessMinutes: 60,
    submitter: 'seller',
    requirePhoto: 'yes',
  },
  transport: {
    thresholdMetres: 20,
    freshnessMinutes: 20,
    submitter: 'delivery',
    requirePhoto: 'yes',
  },
  land: {
    thresholdMetres: 20,
    freshnessMinutes: 60,
    submitter: 'any',
    requirePhoto: 'yes',
  },
};

/** Map tile URL from env var, falling back to OpenStreetMap.
 * In production, set VITE_MAP_TILE_URL to a paid/self-hosted provider. */
export const MAP_TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ||
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
