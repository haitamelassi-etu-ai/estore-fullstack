import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { gsap } from '../../../core/gsap';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: any[] = [];
  filteredProducts: Product[] = [];
  selectedCategory = 'Tous';
  searchTerm = '';
  sortOption = 'default';
  loading = false;
  skeletonItems = Array(8);

  private searchSubject = new Subject<string>();
  private ctx?: gsap.Context;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
      this.animateCards();
    });

    /* Header entrance */
    gsap.fromTo('.catalog-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 });
    gsap.fromTo('.catalog-controls > *', { y: -16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.35 });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
        setTimeout(() => this.animateCards(), 60);
      },
      error: () => this.loading = false
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(cats => {
      this.categories = [{ id: 0, name: 'Tous' }, ...cats];
      setTimeout(() => {
        gsap.fromTo('.cat-pill', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power3.out', delay: 0.5 });
      }, 50);
    });
  }

  onSearch(term: string): void { this.searchSubject.next(term); }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilters();
    this.animateCards();
  }

  applyFilters(): void {
    let result = [...this.products];
    if (this.selectedCategory !== 'Tous') {
      result = result.filter(p => p.category?.name === this.selectedCategory);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t)
      );
    }
    if (this.sortOption === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (this.sortOption === 'price-desc') result.sort((a, b) => b.price - a.price);
    this.filteredProducts = result;
  }

  private animateCards(): void {
    this.ctx?.revert();
    setTimeout(() => {
      this.ctx = gsap.context(() => {
        gsap.fromTo('.product-grid app-product-card',
          { y: 45, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out' }
        );
      }, this.el.nativeElement);
    }, 30);
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

  viewDetail(product: Product): void { this.router.navigate(['/catalog', product.id]); }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
