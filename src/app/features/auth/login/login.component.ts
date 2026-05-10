import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { gsap } from '../../../core/gsap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  form: FormGroup;
  loading = false;
  error = '';
  private ctx?: gsap.Context;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.fromTo('.auth-card', { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' });
      gsap.fromTo('.auth-card h2, .auth-card > p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.form-group', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.45 });
      gsap.fromTo('.btn-full, .form-note', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.7 });
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.toast.success('Bienvenue !', 'Connexion réussie');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'E-mail ou mot de passe incorrect.';
        this.loading = false;
        gsap.from('.err-msg', { x: -6, duration: 0.05, repeat: 5, yoyo: true, ease: 'none' });
      }
    });
  }

  ngOnDestroy(): void { this.ctx?.revert(); }
}
