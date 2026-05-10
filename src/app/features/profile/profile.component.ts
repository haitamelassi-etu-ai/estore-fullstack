import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { gsap } from '../../core/gsap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  loading = false;
  private ctx?: gsap.Context;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public authService: AuthService,
    private toast: ToastService
  ) {
    const u = authService.currentUser;
    this.form = this.fb.group({
      firstName: [u?.firstName || '', Validators.required],
      lastName: [u?.lastName || '', Validators.required],
      email: [u?.email || '', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      country: ['Maroc']
    });
  }

  ngOnInit(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;
    this.http.get<any>(`${environment.apiUrl}/users/${userId}/profile`).subscribe({
      next: (profile) => this.form.patchValue(profile),
      error: () => {}
    });
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.fromTo('.profile-sidebar', { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 });
      gsap.fromTo('.profile-content', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      gsap.fromTo('.profile-sidebar .avatar-lg', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.4 });
      gsap.fromTo('.profile-nav .pnav-item', { x: -20, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: 'power3.out', delay: 0.55 });
      gsap.fromTo('.profile-content h2', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.4 });
      gsap.fromTo('.form-group, .form-grid', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: 'power3.out', delay: 0.5 });
    });
  }

  get initials(): string {
    const u = this.authService.currentUser;
    if (!u) return '?';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const userId = this.authService.currentUser?.id;
    this.http.put(`${environment.apiUrl}/users/${userId}/profile`, this.form.value).subscribe({
      next: () => {
        this.toast.success('Profil mis à jour', 'Vos informations ont été sauvegardées');
        this.loading = false;
      },
      error: () => {
        this.toast.error('Erreur', 'Impossible de sauvegarder');
        this.loading = false;
      }
    });
  }

  logout(): void { this.authService.logout(); }

  ngOnDestroy(): void { this.ctx?.revert(); }
}
