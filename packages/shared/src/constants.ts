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

export const COMMISSION_RATE_DEFAULT = 15;

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
