import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  Category,
  Product,
  Review,
  SearchHistory,
  SearchHistoryPayload
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsUrl = `${environment.apiUrl}/products`;
  private readonly categoriesUrl = `${environment.apiUrl}/categories`;
  private readonly reviewsUrl = `${environment.apiUrl}/reviews`;
  private readonly searchHistoryUrl = `${environment.apiUrl}/search-history`;

  constructor(private http: HttpClient) {}

  getProducts(keyword?: string, categoryId?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http
      .get<ApiResponse<Product[]>>(this.productsUrl, { params })
      .pipe(map(response => response.data ?? []));
  }

  getProductById(productId: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.productsUrl}/${productId}`)
      .pipe(map(response => response.data));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(this.categoriesUrl)
      .pipe(map(response => response.data ?? []));
  }

  getReviews(productId: number): Observable<Review[]> {
    return this.http
      .get<ApiResponse<Review[]>>(`${this.reviewsUrl}/product/${productId}`)
      .pipe(map(response => response.data ?? []));
  }

  addReview(review: Review): Observable<Review> {
    return this.http
      .post<ApiResponse<Review>>(this.reviewsUrl, review)
      .pipe(map(response => response.data));
  }

  saveSearchHistory(payload: SearchHistoryPayload): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(this.searchHistoryUrl, {
        userId: payload.userId.toString(),
        keyword: payload.keyword
      })
      .pipe(map(() => undefined));
  }

  getSearchHistory(userId: number): Observable<SearchHistory[]> {
    return this.http
      .get<ApiResponse<SearchHistory[]>>(`${this.searchHistoryUrl}/${userId}`)
      .pipe(map(response => response.data ?? []));
  }
}
