import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserProfile } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading = false;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    city: [''],
    country: ['']
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }

    this.saving = true;
    this.userService
      .updateProfile(userId, this.form.getRawValue() as UserProfile)
      .subscribe({
        next: profile => {
          this.authService.updateCurrentUserProfile(profile);
          this.saving = false;
          this.toastService.success('Profile updated', 'Changes saved successfully.');
        },
        error: error => {
          this.saving = false;
          this.toastService.error(
            'Save failed',
            error?.error?.message ?? 'Unable to update your profile.'
          );
        }
      });
  }

  private loadProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }
    this.loading = true;
    this.userService.getProfile(userId).subscribe({
      next: profile => {
        this.form.patchValue(
          profile as Partial<{
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            country: string;
          }>
        );
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.toastService.error(
          'Profile unavailable',
          error?.error?.message ?? 'Unable to load your profile.'
        );
      }
    });
  }
}
