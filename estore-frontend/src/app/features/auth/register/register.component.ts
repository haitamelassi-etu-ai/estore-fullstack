import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) {
    return null;
  }
  return password === confirmPassword ? null : { mismatch: true };
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;
  serverError = '';

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator }
  );

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
    const { confirmPassword, ...registerPayload } = this.form.getRawValue();
    this.loading = true;
    this.serverError = '';

    this.authService.register(registerPayload as RegisterRequest).subscribe({
      next: () => {
        this.toastService.success(
          'Account created',
          'You can now sign in with your credentials.'
        );
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: error => {
        this.serverError =
          error?.error?.message ?? 'Unable to create account. Please try again.';
        this.toastService.error('Registration failed', this.serverError);
        this.loading = false;
      }
    });
  }
}
