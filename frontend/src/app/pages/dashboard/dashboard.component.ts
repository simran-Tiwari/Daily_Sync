import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <nav class="topbar">
        <div class="logo">⚡ DailySync</div>
        <div class="user-info">
          <span>{{ user?.name }}</span>
          <button class="btn-outline sm" (click)="auth.logout()">Logout</button>
          <button class="btn-outline sm" (click)="theme.toggle()">{{ theme.isDark() ? '☀️' : '🌙' }}</button>
        </div>
      </nav>

      <div class="content">
        <h2>Your Teams</h2>

        <div class="team-grid">
          <a class="team-card card" *ngFor="let team of teams"
             [routerLink]="['/team', team.name]"
             [state]="{ teamId: team._id }">
            <div class="team-name">{{ team.name }}</div>
            <div class="invite-code">Code: <strong>{{ team.inviteCode }}</strong></div>
            <span class="view-btn">View standup</span>
          </a>

          <div class="team-card card placeholder" *ngIf="teams.length === 0 && !loading">
            No teams yet. Create or join one below.
          </div>
        </div>

        <div class="actions">
          <div class="card action-panel">
            <h3>Create a Team</h3>
            <input type="text" [(ngModel)]="newTeamName" placeholder="Team name" />
            <button class="btn-primary" (click)="createTeam()" [disabled]="!newTeamName.trim()">Create</button>
            <p class="error" *ngIf="createError">{{ createError }}</p>
          </div>

          <div class="card action-panel">
            <h3>Join a Team</h3>
            <input type="text" [(ngModel)]="inviteCode" placeholder="6-char invite code" maxlength="6" style="text-transform:uppercase" />
            <button class="btn-primary" (click)="joinTeam()" [disabled]="!inviteCode.trim()">Join</button>
            <p class="error" *ngIf="joinError">{{ joinError }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
 styles: [`
  .page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    color: white;
    border-radius: 0 0 20px 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    margin-bottom: 24px;
  }

  .logo {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    letter-spacing: 0.4px;
    transition: all 0.25s ease;
  }

  .logo:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
  }

  .user-info span,
  .user-info button {
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    padding: 10px 16px;
    color: white;
    transition: all 0.25s ease;
  }

  .user-info span:hover,
  .user-info button:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  }

  .sm {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .content {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .team-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
  }

  .team-card:hover {
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
    transform: translateY(-3px);
  }

  .team-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .invite-code {
    font-size: 0.8rem;
    color: #64748b;
  }

  .view-btn {
    margin-top: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #6366f1;
    background: #ede9fe;
    padding: 4px 12px;
    border-radius: 999px;
    align-self: flex-start;
    transition: all 0.2s ease;
  }

  .team-card:hover .view-btn {
    background: #6366f1;
    color: #fff;
  }

  .placeholder {
    color: #94a3b8;
    font-style: italic;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .action-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-panel h3 {
    font-size: 1rem;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    .topbar {
      padding: 14px 16px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .logo {
      font-size: 1rem;
      padding: 8px 12px;
    }

    .user-info {
      gap: 8px;
      flex-wrap: wrap;
    }

    .user-info span,
    .user-info button {
      padding: 8px 12px;
      font-size: 0.85rem;
    }

    .actions {
      grid-template-columns: 1fr;
    }
  }
`]
})
export class DashboardComponent implements OnInit {
  teams: any[] = [];
  loading = true;
  newTeamName = '';
  inviteCode = '';
  createError = '';
  joinError = '';
  user: any;

  constructor(public auth: AuthService, private teamService: TeamService, private router: Router, public theme: ThemeService) {
    this.user = auth.getUser();
  }

  ngOnInit() {
    this.teamService.getMyTeams().subscribe({
      next: teams => { this.teams = teams; this.loading = false; },
      error: () => this.loading = false
    });
  }

  createTeam() {
    this.createError = '';
    this.teamService.create(this.newTeamName.trim()).subscribe({
      next: team => { this.teams.push(team); this.newTeamName = ''; },
      error: e => this.createError = e.error?.message || 'Failed to create team'
    });
  }

  joinTeam() {
    this.joinError = '';
    this.teamService.join(this.inviteCode.trim().toUpperCase()).subscribe({
      next: team => { this.teams.push(team); this.inviteCode = ''; },
      error: e => this.joinError = e.error?.message || 'Failed to join team'
    });
  }
}
