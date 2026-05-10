import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { gsap } from '../../../core/gsap';

function passwordMatch(control: AbstractControl) {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  form: FormGroup;
  loading = false;
  private ctx?: gsap.Context;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatch });
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' });
      gsap.fromTo('.auth-card h2, .auth-card > p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.form-group, .form-grid .form-group', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: 'power3.out', delay: 0.45 });
      gsap.fromTo('.btn-full, .form-note', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.75 });
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { confirmPassword, ...userData } = this.form.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.toast.success('Compte créé !', 'Bienvenue sur E·Store');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.toast.error('Erreur', err.error?.message || 'Inscription échouée');
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void { this.ctx?.revert(); }
}
