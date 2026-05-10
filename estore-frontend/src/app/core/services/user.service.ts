import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User, UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUser(userId: number): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.usersUrl}/${userId}`)
      .pipe(map(response => response.data));
  }

  getProfile(userId: number): Observable<UserProfile> {
    return this.http
      .get<ApiResponse<UserProfile>>(`${this.usersUrl}/${userId}/profile`)
      .pipe(map(response => response.data));
  }

  updateProfile(userId: number, profile: UserProfile): Observable<UserProfile> {
    return this.http
      .put<ApiResponse<UserProfile>>(`${this.usersUrl}/${userId}/profile`, profile)
      .pipe(map(response => response.data));
  }
}
