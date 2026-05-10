import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthRequest,
  AuthResponse,
  RegisterRequest,
  User
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'token';
  private readonly userKey = 'user';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.rehydrateUser();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!this.getToken();
  }

  getToken(): string | null {
    return this.readStorage(this.tokenKey);
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.authUrl}/register`, payload)
      .pipe(map(response => response.data));
  }

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.authUrl}/login`, payload)
      .pipe(
        map(response => response.data),
        tap(response => {
          this.writeStorage(this.tokenKey, response.token);
          this.writeStorage(this.userKey, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  getCurrentUserId(): number | null {
    const userId = this.currentUserSubject.value?.id;
    return typeof userId === 'number' ? userId : null;
  }

  getCurrentUserShippingAddress(): string {
    const profile = this.currentUserSubject.value?.profile;
    const segments = [profile?.address, profile?.city, profile?.country]
      .map(value => value?.trim())
      .filter((value): value is string => !!value);
    if (segments.length) {
      return segments.join(', ');
    }
    return 'Shipping address not provided';
  }

  updateCurrentUserProfile(profile: User['profile']): void {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return;
    }
    this.updateCurrentUser({
      ...currentUser,
      firstName: profile?.firstName ?? currentUser.firstName,
      lastName: profile?.lastName ?? currentUser.lastName,
      email: profile?.email ?? currentUser.email,
      profile
    });
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.writeStorage(this.userKey, JSON.stringify(user));
  }

  logout(redirect = true): void {
    this.removeStorage(this.tokenKey);
    this.removeStorage(this.userKey);
    this.currentUserSubject.next(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  private rehydrateUser(): void {
    const token = this.readStorage(this.tokenKey);
    const storedUser = this.readStorage(this.userKey);
    if (!token || !storedUser) {
      return;
    }

    try {
      this.currentUserSubject.next(JSON.parse(storedUser) as User);
    } catch {
      this.logout(false);
    }
  }

  private readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  private removeStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      return;
    }
  }
}
