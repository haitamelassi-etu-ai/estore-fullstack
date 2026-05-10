import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { gsap } from '../../core/gsap';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  private ctx?: gsap.Context;

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    this.ctx = gsap.context(() => {
      gsap.fromTo('.orders-wrap .sec-label, .orders-wrap h1',
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power3.out' }
      );
    });

    const userId = this.authService.currentUser?.id!;
    this.orderService.getUserOrders(userId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        setTimeout(() => {
          gsap.fromTo('.order-card',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power3.out' }
          );
        }, 50);
      },
      error: () => this.loading = false
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', PROCESSING: 'En traitement',
      SHIPPED: 'Expédié', DELIVERED: 'Livré', CANCELLED: 'Annulé'
    };
    return map[status] || status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      DELIVERED: 'status-delivered', PROCESSING: 'status-processing',
      SHIPPED: 'status-shipped', PENDING: 'status-pending', CANCELLED: 'status-cancelled'
    };
    return map[status] || '';
  }

  ngOnDestroy(): void { this.ctx?.revert(); }
}
