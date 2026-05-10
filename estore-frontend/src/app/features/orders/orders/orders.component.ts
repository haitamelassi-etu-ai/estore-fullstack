import { Component, OnInit } from '@angular/core';
import { Order } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'status-pending',
      PROCESSING: 'status-processing',
      SHIPPED: 'status-shipped',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled'
    };
    return classes[status] ?? '';
  }

  private loadOrders(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }
    this.loading = true;
    this.orderService.getUserOrders(userId).subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.toastService.error(
          'Orders unavailable',
          error?.error?.message ?? 'Unable to load your order history.'
        );
      }
    });
  }
}
