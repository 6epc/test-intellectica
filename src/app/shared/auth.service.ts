import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { loginUserInfo, RegisterUserInfo } from './models.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  register(userData: RegisterUserInfo) {
    return this.http.post<RegisterUserInfo>(`${environment.apiUrl}/users`,userData);
  }

  login(email: string, password: string): Observable<RegisterUserInfo> {
    return this.http.post<RegisterUserInfo>(`${environment.apiUrl}/login`, { email, password }
      ).pipe(
      tap((user: RegisterUserInfo) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/dashboard']);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }
}
