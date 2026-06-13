import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="logo">⚡ DailySync</div>
        <h2>Create your account</h2>
        <form (ngSubmit)="submit()">
          <label>Name</label>
          <input type="text" [(ngModel)]="name" name="name" placeholder="Your name" required />
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required />
          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="password" placeholder="Min 6 characters" required />
          <p class="error" *ngIf="error">{{ error }}</p>
          <button type="submit" class="btn-primary full" [disabled]="loading">
            {{ loading ? 'Creating account…' : 'Sign up' }}
          </button>
        </form>
        <p class="switch">Already have an account? <a routerLink="/login">Log in</a></p>
      </div>
    </div>
  `,
 

  styles: [`
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef2ff, #faf5ff);
    padding: 24px;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--surface);
    padding: 36px;
    border-radius: 20px;
    border: 1px solid var(--border);
    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
    transition: all 0.3s ease;
  }

  .auth-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px rgba(99, 102, 241, 0.18);
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--accent);
    margin-bottom: 10px;
    text-align: center;
  }

  h2 {
    font-size: 1.7rem;
    font-weight: 700;
    margin-bottom: 28px;
    text-align: center;
    color: var(--text);
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 8px;
    margin-top: 16px;
    color: var(--text);
  }

  input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid var(--border-input);
    background: var(--surface);
    color: var(--text);
    transition: all 0.25s ease;
  }

  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  }

  .full {
    width: 100%;
    margin-top: 24px;
    padding: 12px;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.25s ease;
  }

  .full:hover {
    transform: translateY(-2px);
  }

  .switch {
    margin-top: 20px;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .switch a {
    color: var(--accent);
    font-weight: 600;
    transition: opacity 0.2s ease;
  }

  .switch a:hover {
    opacity: 0.8;
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 28px 22px;
    }

    h2 {
      font-size: 1.5rem;
    }

    .logo {
      font-size: 1.3rem;
    }
  }
`]
})
export class SignupComponent {
  name = ''; email = ''; password = ''; error = ''; loading = false;
  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = ''; this.loading = true;
    this.auth.signup({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: e => { this.error = e.error?.message || 'Signup failed'; this.loading = false; }
    });
  }
}
