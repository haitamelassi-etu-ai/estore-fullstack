export interface Category {
  id?: number;
  name: string;
  description?: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  icon?: string;
  category: Category;
  inventoryQuantity?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Inventory {
  id?: number;
  quantity: number;
  productId: number;
}

export interface Review {
  id?: string;
  productId: number;
  userId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}
