import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cart, CartItem } from '../../core/models/order.model';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { gsap } from '../../core/gsap';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  promoCode = '';
  discount = 0;
  checkingOut = false;
  private sub!: Subscription;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    gsap.fromTo('.cart-section', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });

    /* Subscribe to cart$ so items show instantly from cached state */
    this.sub = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    /* Also refresh from server to ensure latest data */
    const userId = this.authService.currentUser?.id!;
    this.cartService.getCart(userId).subscribe({
      error: () => this.toast.error('Erreur', 'Impossible de charger le panier')
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get subtotal(): number {
    return this.cart?.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0;
  }

  get total(): number { return this.subtotal * (1 - this.discount / 100); }

  updateQty(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty <= 0) { this.removeItem(item); return; }
    this.cartService.updateItem(item.id!, newQty).subscribe();
  }

  removeItem(item: CartItem): void {
    const name = item.product.name;
    this.cartService.removeItem(item.id!).subscribe({
      next: () => this.toast.info('Retiré', name)
    });
  }

  applyPromo(): void {
    if (this.promoCode.toUpperCase() === 'ESTORE10') {
      this.discount = 10;
      this.toast.success('Code appliqué !', 'Réduction de 10% activée');
      gsap.fromTo('.summary-line.discount', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
    } else {
      const input = document.querySelector('.promo-input') as HTMLElement;
      if (input) gsap.from(input, { x: -8, duration: 0.06, repeat: 5, yoyo: true, ease: 'none' });
      this.toast.error('Code invalide', 'Ce code promo n\'existe pas');
    }
  }

  checkout(): void {
    if (!this.cart?.items.length) { this.toast.error('Panier vide', 'Ajoutez des articles'); return; }
    this.checkingOut = true;
    const userId = this.authService.currentUser?.id!;
    this.orderService.placeOrder(userId).subscribe({
      next: () => {
        this.cartService.clearLocal();
        this.toast.success('Commande confirmée !', `Total : ${this.total.toFixed(2)} €`);
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.toast.error('Erreur', 'Impossible de valider la commande');
        this.checkingOut = false;
      }
    });
  }
}
