import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartItem } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  checkingOut = false;
  promoCode = '';
  discountPercent = 0;
  processingItemId: number | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  get subtotal(): number {
    return (
      this.cart?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ??
      0
    );
  }

  get discountAmount(): number {
    return this.subtotal * (this.discountPercent / 100);
  }

  get total(): number {
    return this.subtotal - this.discountAmount;
  }

  updateQuantity(item: CartItem, quantity: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }
    if (quantity < 1) {
      this.removeItem(item);
      return;
    }
    this.processingItemId = item.id as number;
    this.cartService.updateItem(userId, item.id as number, quantity).subscribe({
      next: cart => {
        this.cart = cart;
        this.processingItemId = null;
      },
      error: error => {
        this.processingItemId = null;
        this.toastService.error(
          'Cart update failed',
          error?.error?.message ?? 'Unable to update item quantity.'
        );
      }
    });
  }

  removeItem(item: CartItem): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }
    this.processingItemId = item.id as number;
    this.cartService.removeItem(userId, item.id as number).subscribe({
      next: cart => {
        this.cart = cart;
        this.processingItemId = null;
        this.toastService.info('Item removed', `${item.product.name} was removed.`);
      },
      error: error => {
        this.processingItemId = null;
        this.toastService.error(
          'Cart update failed',
          error?.error?.message ?? 'Unable to remove item from cart.'
        );
      }
    });
  }

  applyPromo(): void {
    if (this.promoCode.trim().toUpperCase() === 'ESTORE10') {
      this.discountPercent = 10;
      this.toastService.success('Promo applied', '10% discount is now active.');
      return;
    }
    this.discountPercent = 0;
    this.toastService.error('Invalid promo code', 'Use a valid code to apply discount.');
  }

  checkout(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }
    if (!this.cart?.items.length) {
      this.toastService.error('Cart empty', 'Add products before checkout.');
      return;
    }
    this.checkingOut = true;
    this.orderService
      .placeOrder(userId, this.authService.getCurrentUserShippingAddress())
      .subscribe({
      next: () => {
        this.checkingOut = false;
        this.cartService.clearLocal();
        this.cart = { items: [] };
        this.toastService.success('Order placed', 'Your order has been confirmed.');
        this.router.navigate(['/orders']);
      },
      error: error => {
        this.checkingOut = false;
        this.toastService.error(
          'Checkout failed',
          error?.error?.message ?? 'Unable to place order.'
        );
      }
    });
  }

  private loadCart(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }
    this.loading = true;
    this.cartService.getCart(userId).subscribe({
      next: cart => {
        this.cart = cart;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.toastService.error(
          'Cart unavailable',
          error?.error?.message ?? 'Unable to load cart details.'
        );
      }
    });
  }
}
