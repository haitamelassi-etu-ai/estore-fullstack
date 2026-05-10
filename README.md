# E-Store Full Stack (Spring Boot + Angular)

## Prerequisites
- Java 17
- Maven 3.9+
- Node.js 18+ and npm 9+
- MySQL 8+ (database: `estore`)
- MongoDB 6+ (database: `estore`)

## Project structure
```text
estore-angular/
├─ estore-backend/   # Spring Boot 3.x API (JPA + MongoDB + Security + JWT)
├─ estore-frontend/  # Angular 17 NgModule app (lazy-loaded features)
└─ README.md
```

## Backend run (`estore-backend`)
1. Configure MySQL/MongoDB in `src/main/resources/application.properties`.
2. Optional DB bootstrap: run `database/init.sql`.
3. Start API:
   ```bash
   mvn spring-boot:run
   ```
4. API base URL: `http://localhost:8080/api`

## Frontend run (`estore-frontend`)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Angular app:
   ```bash
   npm start
   ```
3. Frontend URL: `http://localhost:4200`

## Test accounts
- Admin: `admin@estore.com` / `Admin@123`
- User: `user@estore.com` / `User@12345`

## API summary
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Products: `GET /api/products`, `GET /api/products/{id}`
- Categories: `GET /api/categories`, `GET /api/categories/{id}`
- Inventory: `GET /api/inventory/{productId}`, `PUT /api/inventory/{productId}`
- Reviews: `GET /api/reviews/product/{productId}`, `POST /api/reviews`
- Search history: `POST /api/search-history`, `GET /api/search-history/{userId}`
- Cart: `GET /api/cart/{userId}`, `POST /api/cart/add`, `PUT /api/cart/update`, `DELETE /api/cart/remove/{itemId}`, `DELETE /api/cart/clear/{userId}`
- Orders: `POST /api/orders`, `GET /api/orders/user/{userId}`, `GET /api/orders/{id}`
- Users/Profile: `GET /api/users/{userId}`, `GET /api/users/{userId}/profile`, `PUT /api/users/{userId}/profile`

## Security/CORS
- Stateless JWT auth, CSRF disabled
- Public endpoints:
  - `POST /api/auth/**`
  - `GET /api/products/**`
  - `GET /api/categories/**`
  - `GET /api/reviews/**`
- All other endpoints require authentication
- Allowed frontend origin: `http://localhost:4200`
