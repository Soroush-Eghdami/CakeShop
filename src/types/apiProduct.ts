
export interface Category {
  id?: number;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface ApiProduct {
  id: string;
  name: string;
  description?: string;
  price: string;
  old_price: string | null;
  image: string | null;
  category: Category;
  is_available: boolean;
  rating?: string;
  reviews_count?: number;
}
