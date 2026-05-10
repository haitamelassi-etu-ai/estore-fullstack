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
  badge?: string;
  rating?: number;
  reviewCount?: number;
  category: Category;
  inventoryQuantity: number;
}

export interface Review {
  id?: string | number;
  productId: number;
  userId: number;
  authorName?: string;
  rating: number;
  comment: string;
  createdAt?: string | Date;
}

export interface SearchHistoryPayload {
  userId: number;
  keyword: string;
}

export interface SearchHistory {
  id?: string;
  userId: number;
  keyword: string;
  searchedAt?: string | Date;
}
