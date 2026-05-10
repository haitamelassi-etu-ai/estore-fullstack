import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { gsap, ScrollTrigger } from '../../../core/gsap';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private ctx!: gsap.Context;
  featuredProducts: Product[] = [];
  categories: any[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  goToCatalog(): void { this.router.navigate(['/catalog']); }

  ngAfterViewInit(): void {
    this.loadData();

    this.ctx = gsap.context(() => {

      /* ── Hero entrance ── */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-label',   { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo('.hero-title',   { y: 55, opacity: 0 }, { y: 0, opacity: 1, duration: 1 },    '-=0.3')
        .fromTo('.hero-sub',     { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.5')
        .fromTo('.hero-actions .btn', { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.14, duration: 0.6 }, '-=0.45')
        .fromTo('.stat, .stat-div',   { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.5 }, '-=0.35')
        .fromTo('.hero-card',    { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.9')
        .fromTo('.hero-float',   { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.65, stagger: 0.15, duration: 0.5, ease: 'back.out(2)' }, '-=0.6');

      /* ── Floating orbs ── */
      gsap.to('.orb-1', { x: 40, y: -30, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.orb-2', { x: -30, y: 40, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5 });
      gsap.to('.orb-3', { x: 25, y: 25, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3 });

      /* ── Floating hero decorations ── */
      gsap.to('.hero-float--1', { y: -14, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.hero-float--2', { y: -10, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });
      gsap.to('.hero-float--3', { y: -12, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.6 });

      /* ── Hero card glow pulse ── */
      gsap.to('.hero-card', { boxShadow: '0 0 60px rgba(201,168,76,.18)', duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      /* ── Stats counters ── */
      document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
        const end = parseFloat(el.getAttribute('data-count')!);
        const suffix = el.getAttribute('data-suffix') || '';
        const dec = parseInt(el.getAttribute('data-decimals') || '0');
        const fmt = (v: number) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suffix;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: end, duration: 2.2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => { el.textContent = fmt(obj.val); }
        });
      });

      /* ── Features section ── */
      gsap.fromTo('.features-section .sec-label, .features-section .sec-title',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-section', start: 'top 85%', once: true }
        }
      );
      gsap.fromTo('.feat-card',
        { y: 65, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-section', start: 'top 82%', once: true }
        }
      );

      /* ── Categories section ── */
      gsap.fromTo('.categories-section .sec-label, .categories-section .sec-title',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.categories-section', start: 'top 85%', once: true }
        }
      );
      gsap.fromTo('.cat-card',
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.categories-section', start: 'top 80%', once: true }
        }
      );

      /* ── CTA section ── */
      gsap.fromTo('.cta-section',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.cta-section', start: 'top 82%', once: true }
        }
      );

    });

    setTimeout(() => ScrollTrigger.refresh(), 400);
  }

  private loadData(): void {
    this.productService.getAll().subscribe(products => {
      this.featuredProducts = products.slice(0, 4);
      setTimeout(() => {
        gsap.fromTo('.featured-section app-product-card',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: '.featured-section', start: 'top 80%', once: true }
          }
        );
        ScrollTrigger.refresh();
      }, 60);
    });

    this.productService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn) {
      this.toast.info('Connexion requise', 'Connectez-vous pour ajouter au panier');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.addItem(product.id!, 1).subscribe({
      next: () => this.toast.success('Ajouté !', product.name),
      error: () => this.toast.error('Erreur', 'Impossible d\'ajouter au panier')
    });
  }

  viewProduct(product: Product): void { this.router.navigate(['/catalog', product.id]); }

  ngOnDestroy(): void { this.ctx?.revert(); }
}
