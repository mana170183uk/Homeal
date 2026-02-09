export interface ChefMenuItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  isVeg: boolean;
  calories: number | null;
  prepTime: number | null;
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
  distance?: number;
  latitude?: number | null;
  longitude?: number | null;
  user: { name: string; avatar: string | null };
  menus: ChefMenu[];
}
