// App-wide constants

export const APP_NAME = "Homeal";
export const APP_TAGLINE = "Healthy Food, From Home";

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const ORDER_AUTO_REJECT_MINUTES = 5;
export const ORDER_REMINDER_SECONDS = 60;

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const IMAGE_MAX_SIZE_MB = 5;
export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const JWT_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "7d";

export const DELIVERY_RADIUS_KM_DEFAULT = 5;
export const DELIVERY_RADIUS_KM_MAX = 15;

export const SEARCH_RADIUS_MILES_DEFAULT = 15;

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  PLACED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

export const AZURE_BLOB_CONTAINER = "homeal-images";

// Placeholder / fallback images (Unsplash free-to-use)
export const PLACEHOLDER_KITCHEN_BANNER = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&fit=crop";
export const PLACEHOLDER_FOOD_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&fit=crop";
export const PLACEHOLDER_CAKE_IMAGE = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&fit=crop";
export const PLACEHOLDER_AVATAR = "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=200&q=80&fit=crop";
