export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface Profile {
  id?: number;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  userId: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
