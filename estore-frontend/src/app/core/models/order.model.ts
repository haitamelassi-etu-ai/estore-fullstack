import { Product } from './product.model';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id?: number;
  userId?: number;
  items: CartItem[];
  itemCount?: number;
  totalAmount?: number;
  createdAt?: string | Date;
}

export interface OrderItem {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id?: number;
  userId?: number;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: string;
  status: OrderStatus;
  orderDate?: string | Date;
}
