import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { API } from '../api';

const AUTH_API = `${API}/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  signup(data: { name: string; email: string; password: string }) {
    return this.http.post<any>(`${AUTH_API}/signup`, data).pipe(tap(r => this.store(r)));
  }

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${AUTH_API}/login`, data).pipe(tap(r => this.store(r)));
  }

  private store(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn() { return !!localStorage.getItem('token'); }
  getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }
}
