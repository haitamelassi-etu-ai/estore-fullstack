import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, Review } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { gsap, ScrollTrigger } from '../../../core/gsap';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  reviews: Review[] = [];
  quantity = 1;
  loading = false;
  reviewForm: FormGroup;
  showReviewForm = false;
  private ctx?: gsap.Context;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private toast: ToastService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loadReviews(id);
        setTimeout(() => this.animateIn(), 60);
      },
      error: () => this.router.navigate(['/catalog'])
    });
  }

  private animateIn(): void {
    this.ctx = gsap.context(() => {
      gsap.fromTo('.breadcrumb', { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.detail-left', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.1 });
      gsap.fromTo('.detail-right .detail-cat', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.25 });
      gsap.fromTo('.detail-right .detail-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.35 });
      gsap.fromTo('.detail-right .detail-rating, .detail-right .detail-price, .detail-right .detail-desc',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out', delay: 0.4 }
      );
      gsap.fromTo('.detail-right .detail-stock, .detail-right .qty-row, .detail-right .features-grid, .detail-right .detail-actions',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.55, ease: 'power3.out', delay: 0.55 }
      );
      gsap.fromTo('.reviews-section', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.reviews-section', start: 'top 85%' }
      });
    });
  }

  loadReviews(productId: number): void {
    this.productService.getReviews(productId).subscribe(r => {
      this.reviews = r;
      setTimeout(() => {
        gsap.fromTo('.review-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' });
      }, 50);
    });
  }

  changeQty(delta: number): void {
    const max = this.product?.inventoryQuantity ?? 99;
    const next = this.quantity + delta;
    if (next >= 1 && next <= max) this.quantity = next;
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.authService.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loading = true;
    this.cartService.addItem(this.product.id!, this.quantity).subscribe({
      next: () => {
        this.toast.success('Ajouté au panier', `${this.quantity}x ${this.product!.name}`);
        this.loading = false;
      },
      error: () => {
        this.toast.error('Erreur', 'Stock insuffisant ou article indisponible');
        this.loading = false;
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.product || !this.authService.currentUser) return;
    const review: Review = {
      productId: this.product.id!,
      userId: this.authService.currentUser.id!,
      authorName: `${this.authService.currentUser.firstName} ${this.authService.currentUser.lastName}`,
      ...this.reviewForm.value
    };
    this.productService.addReview(review).subscribe({
      next: (r) => {
        this.reviews.unshift(r);
        this.showReviewForm = false;
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.toast.success('Avis publié !', 'Merci pour votre retour');
        setTimeout(() => gsap.fromTo('.review-card:first-child', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }), 30);
      },
      error: () => this.toast.error('Erreur', 'Impossible de publier l\'avis')
    });
  }

  stars(n: number): string[] {
    return Array(5).fill('').map((_, i) => i < n ? '★' : '☆');
  }

  ngOnDestroy(): void { this.ctx?.revert(); }
}
