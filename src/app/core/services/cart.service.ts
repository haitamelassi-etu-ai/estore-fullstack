import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, CartItem } from '../models/order.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  get itemCount(): number {
    return this.cartSubject.value?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  get total(): number {
    return this.cartSubject.value?.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0;
  }

  getCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItem(productId: number, quantity: number): Observable<Cart> {
    const userId = this.authService.currentUser?.id;
    return this.http.post<Cart>(`${this.apiUrl}/add`, { userId, productId, quantity }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/update`, { itemId, quantity }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/remove/${itemId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearLocal(): void {
    this.cartSubject.next(null);
  }
}
