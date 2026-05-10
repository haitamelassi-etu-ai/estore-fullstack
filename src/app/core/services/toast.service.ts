import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  icon: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(icon: string, title: string, message: string, type: Toast['type'] = 'success'): void {
    this.toastSubject.next({ icon, title, message, type });
    setTimeout(() => this.toastSubject.next(null), 3500);
  }

  success(title: string, message: string): void {
    this.show('check-circle', title, message, 'success');
  }

  error(title: string, message: string): void {
    this.show('x-circle', title, message, 'error');
  }

  info(title: string, message: string): void {
    this.show('info-circle', title, message, 'info');
  }
}
