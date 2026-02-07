// Shared types for Homeal platform

export type UserRole = "CUSTOMER" | "CHEF" | "ADMIN" | "SUPER_ADMIN";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

export type ServiceType =
  | "INDIVIDUAL_TIFFIN"
  | "PARTY_ORDERS"
  | "CATERING"
  | "BULK_ORDERS"
  | "MEAL_KITS";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CARD" | "UPI" | "WALLET" | "COD";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED";
export type NotificationType = "ORDER_UPDATE" | "PROMOTION" | "SYSTEM" | "CHAT";

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Socket.IO event types
export interface SocketEvents {
  "order:new": { orderId: string; chefId: string };
  "order:update": { orderId: string; status: OrderStatus };
  "order:accepted": { orderId: string; estimatedTime: number };
  "order:rejected": { orderId: string; reason?: string };
  "notification:new": {
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
  };
  "chef:online": { chefId: string };
  "chef:offline": { chefId: string };
}

// Auth types
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  firebaseUid: string;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

// Order creation
export interface CreateOrderInput {
  chefId: string;
  addressId: string;
  items: { menuItemId: string; quantity: number; notes?: string }[];
  specialInstructions?: string;
  promoCode?: string;
}
