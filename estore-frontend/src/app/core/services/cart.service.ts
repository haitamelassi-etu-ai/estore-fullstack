import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, Product } from '../models/product.model';
import { Cart } from '../models/order.model';

interface CartItemApi {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface CartApi {
  id: number;
  userId: number;
  items: CartItemApi[];
  itemCount: number;
  totalAmount: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartUrl = `${environment.apiUrl}/cart`;
  private readonly cartSubject = new BehaviorSubject<Cart | null>(null);
  readonly cart$ = this.cartSubject.asObservable();
  private readonly fallbackCategory: Category = { id: 0, name: 'General' };

  constructor(private http: HttpClient) {}

  get itemCount(): number {
    return (
      this.cartSubject.value?.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ) ?? 0
    );
  }

  get total(): number {
    return (
      this.cartSubject.value?.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      ) ?? 0
    );
  }

  getCart(userId: number): Observable<Cart> {
    return this.http
      .get<ApiResponse<CartApi>>(`${this.cartUrl}/${userId}`)
      .pipe(map(response => this.toCart(response.data)))
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  addItem(_userId: number, productId: number, quantity: number): Observable<Cart> {
    return this.http
      .post<ApiResponse<CartApi>>(`${this.cartUrl}/add`, { productId, quantity })
      .pipe(map(response => this.toCart(response.data)))
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  updateItem(_userId: number, itemId: number, quantity: number): Observable<Cart> {
    return this.http
      .put<ApiResponse<CartApi>>(`${this.cartUrl}/update`, { itemId, quantity })
      .pipe(map(response => this.toCart(response.data)))
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  removeItem(_userId: number, itemId: number): Observable<Cart> {
    return this.http
      .delete<ApiResponse<CartApi>>(`${this.cartUrl}/remove/${itemId}`)
      .pipe(map(response => this.toCart(response.data)))
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  clearCart(userId: number): Observable<Cart> {
    return this.http
      .delete<ApiResponse<CartApi>>(`${this.cartUrl}/clear/${userId}`)
      .pipe(
        map(response => this.toCart(response.data)),
        tap(cart => this.cartSubject.next(cart))
      );
  }

  clearLocal(): void {
    this.cartSubject.next(null);
  }

  private toCart(cart: CartApi): Cart {
    return {
      id: cart?.id,
      userId: cart?.userId,
      items: (cart?.items ?? []).map(item => ({
        id: item.id,
        product: this.toProduct(item.productId, item.productName, item.unitPrice, item.imageUrl),
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      itemCount: cart?.itemCount ?? 0,
      totalAmount: cart?.totalAmount ?? 0,
      createdAt: cart?.createdAt
    };
  }

  private toProduct(
    productId: number,
    productName: string,
    unitPrice: number,
    imageUrl?: string
  ): Product {
    return {
      id: productId,
      name: productName,
      description: '',
      price: unitPrice,
      imageUrl,
      category: this.fallbackCategory,
      inventoryQuantity: 0
    };
  }
}
