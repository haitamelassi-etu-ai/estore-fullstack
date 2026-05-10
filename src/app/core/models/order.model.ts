import { Product } from './product.model';
import { User } from './user.model';

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id?: number;
  user: User;
  items: CartItem[];
  createdAt?: Date;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id?: number;
  user?: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate?: Date;
}
