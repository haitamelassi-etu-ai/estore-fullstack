import { Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { distinctUntilChanged } from 'rxjs/operators';
import { gsap, ScrollTrigger } from './core/gsap';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="cursor-dot"></div>
    <div class="cursor-ring"></div>
    <app-navbar></app-navbar>
    <main class="main-content" [@routeAnim]="getRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-toast></app-toast>
  `,
  styles: [`
    .main-content { min-height: calc(100vh - 64px - 80px); position: relative; }
  `],
  animations: [
    trigger('routeAnim', [
      transition('* <=> *', [
        query(':leave', style({ display: 'none' }), { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(18px)' }),
          animate('380ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      distinctUntilChanged((a, b) => a?.id === b?.id)
    ).subscribe(user => {
      if (user) {
        this.cartService.getCart(user.id!).subscribe();
      } else {
        this.cartService.clearLocal();
      }
    });

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      this.ngZone.runOutsideAngular(() => this.initCursor());
    }
  }

  getRoute(outlet: RouterOutlet): string {
    return outlet?.isActivated ? (outlet.activatedRoute.snapshot.url[0]?.path || 'home') : '';
  }

  private initCursor(): void {
    const dot = document.querySelector('.cursor-dot') as HTMLElement;
    const ring = document.querySelector('.cursor-ring') as HTMLElement;
    if (!dot || !ring) return;

    dot.style.opacity = '1';
    ring.style.opacity = '1';
    document.body.style.cursor = 'none';

    document.addEventListener('mousemove', (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08 });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.38, ease: 'power2.out' });
    });

    document.addEventListener('mouseover', (e) => {
      if ((e.target as Element).closest('a, button, .product-card, .feat-card, .cat-pill')) {
        gsap.to(ring, { scale: 2, opacity: 0.35, duration: 0.25 });
      }
    });

    document.addEventListener('mouseout', (e) => {
      if ((e.target as Element).closest('a, button, .product-card, .feat-card, .cat-pill')) {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35 });
      }
    });
  }
}
