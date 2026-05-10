import { Component, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast" *ngIf="toast" [@slideIn] [class]="'toast toast--' + toast.type">
      <span class="toast-icon">
        <app-icon [name]="toast.icon" [size]="20"></app-icon>
      </span>
      <div class="toast-msg">
        <strong>{{ toast.title }}</strong>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 999;
      background: #1c1c2e; border: 1px solid rgba(201,168,76,0.2);
      border-radius: 16px; padding: 1rem 1.3rem;
      display: flex; align-items: center; gap: 0.85rem;
      max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .toast-icon { display: flex; align-items: center; flex-shrink: 0; }
    .toast--success .toast-icon { color: #3ecf8e; }
    .toast--error   .toast-icon { color: #f87171; }
    .toast--info    .toast-icon { color: #60a5fa; }
    .toast-msg strong { display: block; font-size: 0.88rem; color: #f5f2eb; margin-bottom: .15rem; }
    .toast-msg span { font-size: 0.75rem; color: #8a8a9a; }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(60px)', opacity: 0 }),
        animate('350ms cubic-bezier(.34,1.56,.64,1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toast: Toast | null = null;
  constructor(private toastService: ToastService) {}
  ngOnInit(): void {
    this.toastService.toast$.subscribe(t => this.toast = t);
  }
}
