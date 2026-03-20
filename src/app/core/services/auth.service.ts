import { Injectable, signal, computed, inject, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, UserRegister, LoginResponse } from '../models';
import { environment } from '../../../environments/environment';

export function initializeAuth(authService: AuthService) {
  return () => authService.initialize();
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _tokenKey = 'pantry_token';
  private readonly _user = signal<User | null>(null);
  private readonly _initialized = signal(false);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isInitialized = this._initialized.asReadonly();

  async initialize(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await this.getMe();
      } catch {
        this.logout(false);
      }
    }
    this._initialized.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this._tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this._tokenKey, token);
  }

  async register(data: UserRegister): Promise<User> {
    const user = await firstValueFrom(
      this.http.post<User>(`${environment.apiUrl}/auth/register`, data),
    );
    return user;
  }

  async login(alias: string, password: string): Promise<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', alias);
    body.set('password', password);

    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    this.setToken(response.access_token);
    await this.getMe();
    return response;
  }

  async getMe(): Promise<User> {
    const user = await firstValueFrom(this.http.get<User>(`${environment.apiUrl}/auth/me`));
    this._user.set(user);
    return user;
  }

  logout(redirect = true): void {
    localStorage.removeItem(this._tokenKey);
    this._user.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  async updateProfile(data: { alias?: string; phone?: string }): Promise<User> {
    const user = await firstValueFrom(
      this.http.put<User>(`${environment.apiUrl}/auth/profile`, data),
    );
    this._user.set(user);
    return user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.put<{ message: string }>(`${environment.apiUrl}/auth/password`, {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    );
  }
}
