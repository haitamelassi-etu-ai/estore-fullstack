import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  serverError = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.loading = true;
    this.serverError = '';
    this.authService.login(payload).subscribe({
      next: () => {
        this.toastService.success('Welcome back', 'You are now signed in.');
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: error => {
        this.serverError =
          error?.error?.message ?? 'Unable to sign in. Please try again.';
        this.toastService.error('Sign-in failed', this.serverError);
        this.loading = false;
      }
    });
  }
}
