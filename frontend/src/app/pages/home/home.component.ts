import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="hero">
      <nav class="nav">
        <div class="logo">⚡ DailySync</div>
        <div class="nav-links">
          <button class="btn-outline" (click)="router.navigate(['/login'])">Log in</button>
          <button class="btn-primary" (click)="router.navigate(['/signup'])">Get started</button>
        </div>
      </nav>

      <section class="hero-body">
        <div class="badge">✨ Built for async teams</div>
        <h1>Standups that actually<br><span class="accent">get done.</span></h1>
        <p class="subtitle">
          DailySync makes daily standups effortless. Fill three prompts, see your whole team's updates, and copy a clean summary to paste anywhere.
        </p>
        <div class="cta-group">
          <button class="btn-primary cta-main" (click)="router.navigate(['/signup'])">Start syncing for free</button>
          <button class="btn-outline" (click)="router.navigate(['/login'])">I already have an account</button>
        </div>
      </section>

      <section class="features">
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>3-Prompt Standups</h3>
          <p>Done yesterday · Doing today · Blockers. That's it. Locked after midnight.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Team Feed</h3>
          <p>See every member's update grouped by day. Blockers are highlighted so nothing slips through.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>One-Click Summary</h3>
          <p>Auto-compiled summary ready to copy and paste into any chat — formatted and clean every time.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔗</div>
          <h3>Invite Code Joining</h3>
          <p>Share a 6-char code. Anyone on your team joins instantly — no email invites needed.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <h3>History View</h3>
          <p>Browse any past day's standups with a date picker. Full archive, always available.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔔</div>
          <h3>Submission Tracker</h3>
          <p>See who's submitted and who hasn't. No more "did you fill the standup?" messages.</p>
        </div>
      </section>

      <section class="how-it-works">
        <h2>How it works</h2>
        <div class="steps">
          <div class="step"><span class="step-num">1</span><strong>Create a team</strong><p>Give your team a name and share the invite code.</p></div>
          <div class="step-divider"></div>
          <div class="step"><span class="step-num">2</span><strong>Fill your standup</strong><p>Three prompts. Done in under a minute.</p></div>
          <div class="step-divider"></div>
          <div class="step"><span class="step-num">3</span><strong>Share the summary</strong><p>Copy the compiled update and paste it anywhere.</p></div>
        </div>
      </section>

      <footer class="footer">
        <p>⚡ DailySync — Keep your team in sync, every day.</p>
      </footer>
    </div>
  `,
 
  styles: [`
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  /* NAVBAR */
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 48px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .logo {
    font-size: 1.4rem;
    font-weight: 800;
    color: white;
    letter-spacing: 0.5px;
  }

  .nav-links {
    display: flex;
    gap: 12px;
  }

  .nav-links a,
  .nav-links button {
    padding: 10px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: white;
    transition: all 0.25s ease;
  }

  .nav-links a:hover,
  .nav-links button:hover {
    background: rgba(255, 255, 255, 0.22);
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  }

  /* HERO SECTION */
  .hero-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 100px 24px 80px;
    background: linear-gradient(
      135deg,
      #eef2ff 0%,
      #f5f3ff 50%,
      #faf5ff 100%
    );
  }

  .badge {
    background: #ede9fe;
    color: #7c3aed;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 8px 18px;
    border-radius: 999px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
  }

  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 24px;
    color: #0f172a;
  }

  .accent {
    color: var(--accent);
  }

  .subtitle {
    max-width: 650px;
    color: #64748b;
    font-size: 1.15rem;
    line-height: 1.8;
    margin-bottom: 40px;
  }

  .cta-group {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .cta-main {
    padding: 14px 30px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 14px;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
  }

  .cta-main:hover {
    transform: translateY(-2px);
  }

  /* FEATURES */
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    padding: 70px 48px;
    background: var(--surface);
  }

  .feature-card {
    padding: 28px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.25s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(99, 102, 241, 0.12);
  }

  .feature-icon {
    font-size: 2.4rem;
    margin-bottom: 16px;
  }

  .feature-card h3 {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--text);
  }

  .feature-card p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.7;
  }

  /* HOW IT WORKS */
  .how-it-works {
    background: var(--bg);
    padding: 80px 48px;
    text-align: center;
  }

  .how-it-works h2 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 48px;
    color: var(--text);
  }

  .steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
  }

  .step {
    background: var(--surface);
    border-radius: 18px;
    padding: 28px;
    width: 220px;
    border: 1px solid var(--border);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.25s ease;
  }

  .step:hover {
    transform: translateY(-4px);
  }

  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: var(--accent);
    color: white;
    border-radius: 50%;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .step strong {
    display: block;
    margin-bottom: 10px;
    font-size: 1rem;
  }

  .step p {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .step-divider {
    width: 50px;
    height: 3px;
    background: #c7d2fe;
    border-radius: 999px;
  }

  /* FOOTER */
  .footer {
    padding: 32px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    background: var(--surface);
  }

  /* MOBILE */
  @media (max-width: 640px) {
    .nav {
      padding: 16px 20px;
    }

    .hero-body {
      padding: 80px 20px 60px;
    }

    .features {
      padding: 50px 20px;
    }

    .how-it-works {
      padding: 50px 20px;
    }

    .step-divider {
      display: none;
    }

    h1 {
      font-size: 2.3rem;
    }
  }
`]
})
export class HomeComponent {
  constructor(public router: Router, private auth: AuthService) {
    if (auth.isLoggedIn()) router.navigate(['/dashboard']);
  }
}
