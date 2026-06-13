import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="logo">⚡ DailySync</div>
        <h2>Welcome back</h2>
        <form (ngSubmit)="submit()">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required />
          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          <p class="error" *ngIf="error">{{ error }}</p>
          <button type="submit" class="btn-primary full" [disabled]="loading">
            {{ loading ? 'Logging in…' : 'Log in' }}
          </button>
        </form>
        <p class="switch">Don't have an account? <a routerLink="/signup">Sign up</a></p>
      </div>
    </div>
  `,
  

  styles: [`
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef2ff, #f5f3ff, #faf5ff);
    padding: 24px;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    padding: 32px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.12);
  }

  .logo {
    font-size: 1.4rem;
    font-weight: 700;
    color: #6366f1;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h2 {
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 24px;
    color: #1e293b;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 6px;
    margin-top: 16px;
    color: #475569;
  }

  input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid #dbeafe;
    background: white;
    transition: all 0.2s ease;
  }

  input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  }

  .full {
    width: 100%;
    margin-top: 24px;
    padding: 13px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.25s ease;
  }

  .full:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
  }

  .switch {
    margin-top: 20px;
    text-align: center;
    font-size: 0.9rem;
    color: #64748b;
  }

  .switch a {
    color: #6366f1;
    font-weight: 600;
    transition: opacity 0.2s ease;
  }

  .switch a:hover {
    opacity: 0.8;
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 24px;
    }

    h2 {
      font-size: 1.4rem;
    }
  }
`]
})
export class LoginComponent {
  email = ''; password = ''; error = ''; loading = false;
  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = ''; this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: e => { this.error = e.error?.message || 'Login failed'; this.loading = false; }
    });
  }
}
