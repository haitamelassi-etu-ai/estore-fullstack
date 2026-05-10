import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product, Review } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  reviews: Review[] = [];
  loadingProduct = false;
  loadingReviews = false;
  addingToCart = false;
  submittingReview = false;
  quantity = 1;
  reviewFormVisible = false;

  readonly reviewForm = this.fb.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const productId = Number(params.get('id'));
      if (!productId) {
        this.router.navigate(['/catalog']);
        return;
      }
      this.loadProduct(productId);
      this.loadReviews(productId);
    });
  }

  get maxQuantity(): number {
    return this.product?.inventoryQuantity ?? 0;
  }

  increaseQuantity(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity += 1;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastService.info('Login required', 'Please sign in to add items.');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.maxQuantity < 1) {
      this.toastService.error('Out of stock', 'This product is not available.');
      return;
    }
    if (this.quantity > this.maxQuantity) {
      this.toastService.error('Stock limit', 'Requested quantity exceeds stock.');
      return;
    }

    this.addingToCart = true;
    this.cartService
      .addItem(userId, this.product.id as number, this.quantity)
      .subscribe({
        next: () => {
          this.toastService.success(
            'Added to cart',
            `${this.quantity} × ${this.product?.name}`
          );
          this.addingToCart = false;
        },
        error: error => {
          this.toastService.error(
            'Cart update failed',
            error?.error?.message ?? 'Unable to add this item to cart.'
          );
          this.addingToCart = false;
        }
      });
  }

  toggleReviewForm(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Login required', 'Please sign in to leave a review.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.reviewFormVisible = !this.reviewFormVisible;
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.product) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastService.info('Login required', 'Please sign in to leave a review.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const review: Review = {
      productId: this.product.id as number,
      userId,
      authorName: `${this.authService.currentUser?.firstName} ${this.authService.currentUser?.lastName}`,
      rating: this.reviewForm.controls.rating.value as number,
      comment: this.reviewForm.controls.comment.value as string
    };

    this.submittingReview = true;
    this.productService.addReview(review).subscribe({
      next: addedReview => {
        this.reviews = [addedReview, ...this.reviews];
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.reviewFormVisible = false;
        this.submittingReview = false;
        this.toastService.success('Review submitted', 'Thank you for your feedback.');
      },
      error: error => {
        this.submittingReview = false;
        this.toastService.error(
          'Review failed',
          error?.error?.message ?? 'Unable to submit review.'
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: number): void {
    this.loadingProduct = true;
    this.productService.getProductById(productId).subscribe({
      next: product => {
        this.product = product;
        this.quantity = product.inventoryQuantity > 0 ? 1 : 0;
        this.loadingProduct = false;
      },
      error: error => {
        this.loadingProduct = false;
        this.toastService.error(
          'Product unavailable',
          error?.error?.message ?? 'Unable to load product details.'
        );
        this.router.navigate(['/catalog']);
      }
    });
  }

  private loadReviews(productId: number): void {
    this.loadingReviews = true;
    this.productService.getReviews(productId).subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
      },
      error: error => {
        this.loadingReviews = false;
        this.toastService.error(
          'Reviews unavailable',
          error?.error?.message ?? 'Unable to load reviews.'
        );
      }
    });
  }
}
