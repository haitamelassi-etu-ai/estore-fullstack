import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Category, Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';

type SortOption = 'none' | 'price-asc' | 'price-desc';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory = '';
  selectedSort: SortOption = 'none';
  loadingProducts = false;
  loadingCategories = false;

  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => {
        this.applyFilters();
        this.saveSearchHistory(term);
      });
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.productService.getCategories().subscribe({
      next: categories => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: error => {
        this.loadingCategories = false;
        this.toastService.error(
          'Categories unavailable',
          error?.error?.message ?? 'Unable to load categories.'
        );
      }
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.applyFilters();
        this.loadingProducts = false;
      },
      error: error => {
        this.loadingProducts = false;
        this.toastService.error(
          'Products unavailable',
          error?.error?.message ?? 'Unable to load products.'
        );
      }
    });
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onSortChange(sortOption: SortOption): void {
    this.selectedSort = sortOption;
    this.applyFilters();
  }

  addToCart(product: Product): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastService.info('Login required', 'Please sign in to add items.');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (product.inventoryQuantity < 1) {
      this.toastService.error('Out of stock', 'This product is not available.');
      return;
    }
    this.cartService.addItem(userId, product.id as number, 1).subscribe({
      next: () =>
        this.toastService.success('Added to cart', `${product.name} added.`),
      error: error =>
        this.toastService.error(
          'Cart update failed',
          error?.error?.message ?? 'Unable to add the product to cart.'
        )
    });
  }

  viewDetail(product: Product): void {
    this.router.navigate(['/catalog', product.id]);
  }

  trackByProduct(_: number, product: Product): number | undefined {
    return product.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilters(): void {
    const searchTerm = this.searchControl.value.trim().toLowerCase();
    const selectedCategoryId = Number(this.selectedCategory);

    const byCategory = this.products.filter(product => {
      if (!selectedCategoryId) {
        return true;
      }
      return product.category.id === selectedCategoryId;
    });

    const bySearch = byCategory.filter(product => {
      if (!searchTerm) {
        return true;
      }
      const searchable = `${product.name} ${product.description} ${product.category.name}`.toLowerCase();
      return searchable.includes(searchTerm);
    });

    const sorted = [...bySearch];
    if (this.selectedSort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    }
    if (this.selectedSort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    }
    this.filteredProducts = sorted;
  }

  private saveSearchHistory(term: string): void {
    const userId = this.authService.getCurrentUserId();
    const keyword = term.trim();
    if (!userId || !keyword) {
      return;
    }
    this.productService.saveSearchHistory({ userId, keyword }).subscribe({
      error: error =>
        this.toastService.error(
          'Search history',
          error?.error?.message ?? 'Unable to save search history.'
        )
    });
  }
}
