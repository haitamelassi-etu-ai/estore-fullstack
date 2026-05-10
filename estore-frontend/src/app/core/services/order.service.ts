import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, Product } from '../models/product.model';
import { Order } from '../models/order.model';

interface OrderItemApi {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderApi {
  id: number;
  userId: number;
  items: OrderItemApi[];
  totalAmount: number;
  shippingAddress: string;
  status: Order['status'];
  orderDate: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly ordersUrl = `${environment.apiUrl}/orders`;
  private readonly fallbackCategory: Category = { id: 0, name: 'General' };

  constructor(private http: HttpClient) {}

  placeOrder(userId: number, shippingAddress: string): Observable<Order> {
    return this.http
      .post<ApiResponse<OrderApi>>(this.ordersUrl, { userId, shippingAddress })
      .pipe(map(response => this.toOrder(response.data)));
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http
      .get<ApiResponse<OrderApi[]>>(`${this.ordersUrl}/user/${userId}`)
      .pipe(map(response => (response.data ?? []).map(order => this.toOrder(order))));
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http
      .get<ApiResponse<OrderApi>>(`${this.ordersUrl}/${orderId}`)
      .pipe(map(response => this.toOrder(response.data)));
  }

  private toOrder(order: OrderApi): Order {
    return {
      id: order.id,
      userId: order.userId,
      items: (order.items ?? []).map(item => ({
        id: item.id,
        product: this.toProduct(item.productId, item.productName, item.unitPrice),
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      status: order.status,
      orderDate: order.orderDate
    };
  }

  private toProduct(productId: number, productName: string, unitPrice: number): Product {
    return {
      id: productId,
      name: productName,
      description: '',
      price: unitPrice,
      category: this.fallbackCategory,
      inventoryQuantity: 0
    };
  }
}
