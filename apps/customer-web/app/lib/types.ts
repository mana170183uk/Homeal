export interface ChefMenuItem {
  id: string;
  name: string;
  price: number;
  offerPrice: number | null;
  image: string | null;
  isVeg: boolean;
  calories: number | null;
  prepTime: number | null;
  stockCount: number | null;
}

export interface ChefMenu {
  id: string;
  name: string;
  items: ChefMenuItem[];
}

export interface Chef {
  id: string;
  kitchenName: string;
  description: string | null;
  cuisineTypes: string | null;
  bannerImage: string | null;
  avgRating: number;
  totalReviews: number;
  deliveryRadius: number;
  isOnline?: boolean;
  operatingHours?: string | null;
  distance?: number;
  latitude?: number | null;
  longitude?: number | null;
  user: { name: string; avatar: string | null };
  menus: ChefMenu[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes: string | null;
  menuItem: { name: string; image: string | null };
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isVeg: boolean;
  calories: number | null;
  prepTime: number | null;
  servingSize: string | null;
  allergens: string | null;
  ingredients: string | null;
  category: Category | null;
  chef: {
    id: string;
    kitchenName: string;
    bannerImage: string | null;
    avgRating: number;
    totalReviews: number;
    distance: number | null;
    user: { name: string; avatar: string | null };
  };
}

export interface ProductDetail extends Product {
  chef: Product["chef"] & {
    latitude: number | null;
    longitude: number | null;
  };
  moreFromSeller: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    isVeg: boolean;
  }[];
}

export interface Order {
  id: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  specialInstructions: string | null;
  createdAt: string;
  actualDelivery: string | null;
  items: OrderItem[];
  chef: { id: string; kitchenName: string; user: { name: string } };
  address: Address | null;
  user: { name: string; email: string };
}
