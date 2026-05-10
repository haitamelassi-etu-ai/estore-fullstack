import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor,
  HttpErrorResponse, HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        // Unwrap ApiResponse<T> envelope so services receive T directly
        if (
          event instanceof HttpResponse &&
          event.body !== null &&
          typeof event.body === 'object' &&
          'success' in event.body &&
          'data' in event.body
        ) {
          return event.clone({ body: event.body.data });
        }
        return event;
      }),
      catchError((err: HttpErrorResponse) => {
        const isAuthEndpoint = req.url.includes('/auth/');
        if (err.status === 401 && !isAuthEndpoint) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
