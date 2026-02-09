const KEYS = {
  POSTCODE: "homeal_postcode",
  LAT: "homeal_lat",
  LNG: "homeal_lng",
  AREA: "homeal_area",
  RADIUS: "homeal_radius",
} as const;

export interface SavedLocation {
  postcode: string;
  lat: string;
  lng: string;
  area: string;
  radius: number;
}

export function getSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  const postcode = localStorage.getItem(KEYS.POSTCODE);
  const lat = localStorage.getItem(KEYS.LAT);
  const lng = localStorage.getItem(KEYS.LNG);
  if (!postcode || !lat || !lng) return null;
  return {
    postcode,
    lat,
    lng,
    area: localStorage.getItem(KEYS.AREA) || "",
    radius: getSavedRadius(),
  };
}

export function saveLocation(data: {
  postcode: string;
  lat: string;
  lng: string;
  area?: string;
  radius?: number;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.POSTCODE, data.postcode);
  localStorage.setItem(KEYS.LAT, data.lat);
  localStorage.setItem(KEYS.LNG, data.lng);
  localStorage.setItem(KEYS.AREA, data.area || "");
  if (data.radius) localStorage.setItem(KEYS.RADIUS, String(data.radius));
}

export function getSavedRadius(): number {
  if (typeof window === "undefined") return 15;
  const saved = localStorage.getItem(KEYS.RADIUS);
  return saved ? Number(saved) : 15;
}

export function saveRadius(radius: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.RADIUS, String(radius));
}

export function clearSavedLocation() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.POSTCODE);
  localStorage.removeItem(KEYS.LAT);
  localStorage.removeItem(KEYS.LNG);
  localStorage.removeItem(KEYS.AREA);
}
