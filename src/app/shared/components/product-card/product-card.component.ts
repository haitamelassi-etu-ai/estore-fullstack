import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import gsap from 'gsap';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetail = new EventEmitter<Product>();

  constructor(private el: ElementRef) {}

  private get card(): HTMLElement {
    return this.el.nativeElement.querySelector('.product-card');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const card = this.card;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    gsap.to(card, {
      rotateX: -dy * 8, rotateY: dx * 8,
      transformPerspective: 900,
      duration: 0.3, ease: 'power2.out', overwrite: 'auto'
    });
    gsap.to(card.querySelector('.pc-img'), {
      x: dx * 6, y: dy * 6, duration: 0.4, ease: 'power2.out', overwrite: 'auto'
    });
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const card = this.card;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.65, ease: 'power3.out', overwrite: 'auto' });
    gsap.to(card.querySelector('.pc-img'), { x: 0, y: 0, duration: 0.65, ease: 'power3.out', overwrite: 'auto' });
  }

  onAddToCart(e: Event): void {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    gsap.timeline()
      .to(btn, { scale: 1.45, duration: 0.12, ease: 'power2.out' })
      .to(btn, { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, .4)' });
    this.addToCart.emit(this.product);
  }
}
