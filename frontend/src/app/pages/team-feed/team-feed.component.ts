import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StandupService } from '../../services/standup.service';
import { TeamService } from '../../services/team.service';
import { ThemeService } from '../../services/theme.service';

const MOODS = ['🚀','😊','😐','😴','🔥','🤯'];

@Component({
  selector: 'app-team-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
     <nav class="topbar">
  <div class="left">
    <a routerLink="/dashboard" class="back">
      ‹ Dashboard
    </a>

    <div class="team-name">
      👥 {{ teamName }}
    </div>
  </div>

  <div class="nav-right">
    <a
      [routerLink]="['/team', teamName, 'history']"
      [state]="{ teamId: teamId }"
      class="btn-outline sm nav-btn">
      📅 History
    </a>

    <button
      class="btn-outline sm nav-btn theme-btn"
      (click)="theme.toggle()">
      {{ theme.isDark() ? '☀️' : '🌙' }}
    </button>
  </div>
</nav>

      <div class="content">

        <!-- Standup Form -->
        <div class="card form-card" *ngIf="!myStandup">
          <h3>Your Standup for Today</h3>
          <label>✅ Done yesterday</label>
          <textarea [(ngModel)]="form.doneYesterday" rows="2" placeholder="What did you complete?"></textarea>
          <label>🎯 Doing today</label>
          <textarea [(ngModel)]="form.doingToday" rows="2" placeholder="What are you working on?"></textarea>
          <label>⚠️ Blockers</label>
          <textarea [(ngModel)]="form.blockers" rows="2" placeholder="Anything blocking you? (leave blank if none)"></textarea>
          <label>😊 Mood <span class="optional">(optional)</span></label>
          <div class="mood-picker">
            <button *ngFor="let m of moods" type="button"
              class="mood-btn" [class.selected]="form.mood === m"
              (click)="form.mood = form.mood === m ? '' : m">{{ m }}</button>
          </div>
          <p class="error" *ngIf="submitError">{{ submitError }}</p>
          <button class="btn-primary submit-btn" (click)="submit()" [disabled]="submitting">
            {{ submitting ? 'Submitting…' : 'Submit Standup' }}
          </button>
        </div>

        <!-- Submitted card -->
        <div class="card form-card submitted" *ngIf="myStandup && editing">
          <h3>Edit Today's Standup</h3>
          <label>✅ Done yesterday</label>
          <textarea [(ngModel)]="form.doneYesterday" rows="2"></textarea>
          <label>🎯 Doing today</label>
          <textarea [(ngModel)]="form.doingToday" rows="2"></textarea>
          <label>⚠️ Blockers</label>
          <textarea [(ngModel)]="form.blockers" rows="2"></textarea>
          <label>😊 Mood</label>
          <div class="mood-picker">
            <button *ngFor="let m of moods" type="button"
              class="mood-btn" [class.selected]="form.mood === m"
              (click)="form.mood = form.mood === m ? '' : m">{{ m }}</button>
          </div>
          <div class="edit-actions">
            <button class="btn-primary" (click)="update()" [disabled]="submitting">Save</button>
            <button class="btn-outline" (click)="editing = false">Cancel</button>
          </div>
        </div>

        <div class="card form-card submitted" *ngIf="myStandup && !editing">
          <div class="submitted-header">
            <div>
              <span>✅ Submitted today {{ myStandup.mood }}</span>
              <div class="edit-note">You can edit this standup within 2 days of submission.</div>
            </div>
            <div class="row-gap">
              <span class="late-badge" *ngIf="myStandup.isLate">⏰ Late</span>
              <button class="btn-outline sm" *ngIf="canEdit()" (click)="startEdit()">Edit</button>
              <span class="locked-label" *ngIf="!canEdit()">🔒 Locked</span>
            </div>
          </div>
        </div>

        <!-- Submission counter -->
        <div class="counter" *ngIf="feedData">
          <span class="count-badge">{{ feedData.standups.length }} / {{ feedData.totalMembers }} submitted</span>
          <span class="unsub" *ngFor="let m of feedData.unsubmitted">{{ m.name }} hasn't submitted</span>
        </div>

        <!-- Feed -->
        <div class="feed" *ngIf="feedData">
          <div class="standup-card card" *ngFor="let s of feedData.standups"
               [class.has-blocker]="s.blockers?.trim() && !s.blockerResolved">
            <div class="s-header">
              <div class="s-left">
                <span class="s-name">👤 {{ s.userId.name }}</span>
                <span class="mood-display" *ngIf="s.mood">{{ s.mood }}</span>
                <span class="streak-badge" *ngIf="streaks[s.userId._id]">🔥 {{ streaks[s.userId._id] }}</span>
                <span class="late-badge" *ngIf="s.isLate">⏰ Late</span>
              </div>
              <div class="s-right">
                <span class="blocker-badge" *ngIf="s.blockers?.trim() && !s.blockerResolved">⚠️ Blocker</span>
                <span class="resolved-badge" *ngIf="s.blockerResolved">✅ Resolved</span>
              </div>
            </div>
            <div class="s-row"><span class="label">✅ Done:</span> {{ s.doneYesterday || '—' }}</div>
            <div class="s-row"><span class="label">🎯 Today:</span> {{ s.doingToday || '—' }}</div>
            <div class="s-row blocker-row" *ngIf="s.blockers?.trim()">
              <span class="label">⚠️ Blocker:</span> {{ s.blockers }}
              <button class="btn-outline xs" *ngIf="!s.blockerResolved" (click)="resolveBlocker(s)">Mark resolved</button>
            </div>

            <!-- Reactions -->
            <div class="reactions">
              <button *ngFor="let e of reactionEmojis" class="react-btn"
                [class.reacted]="hasReacted(s, e)"
                (click)="react(s, e)">
                {{ e }} <span class="react-count">{{ reactionCount(s, e) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="card summary-card" *ngIf="summary">
          <div class="summary-header">
            <h3>📋 Compiled Summary</h3>
            <div class="row-gap">
              <button class="btn-outline sm" (click)="exportCsv()">⬇️ CSV</button>
              <button class="btn-outline sm" (click)="exportPdf()">🖨️ PDF</button>
              <button class="btn-primary sm" (click)="copy()">{{ copied ? '✅ Copied!' : '📋 Copy' }}</button>
            </div>
          </div>
          <pre class="summary-text" id="summary-print">{{ summary }}</pre>
        </div>

        <!-- Admin Panel -->
        <div class="card admin-card" *ngIf="isAdmin">
          <h3>⚙️ Team Settings</h3>
          <div class="admin-row">
            <label>Invite code: <strong>{{ feedData?.inviteCode || currentInviteCode }}</strong></label>
            <button class="btn-outline sm" (click)="regenerateCode()">Regenerate</button>
          </div>
          <div class="admin-row">
            <label>Standup due time</label>
            <input type="time" [(ngModel)]="dueTime" style="width:140px" />
            <button class="btn-primary sm" (click)="saveDueTime()">Save</button>
          </div>
          <div class="members-list" *ngIf="feedData">
            <div class="member-row" *ngFor="let m of allMembers">
              <span>{{ m.name }}</span>
              <button class="btn-outline xs danger" *ngIf="m._id !== currentUserId" (click)="removeMember(m)">Remove</button>
            </div>
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

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .back {
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 10px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.8);
    transition: all 0.25s ease;
  }

  .team-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    letter-spacing: 0.4px;
  }

  .sm {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

  .xs {
    padding: 3px 10px;
    font-size: 0.78rem;
  }

  .btn-outline.sm {
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: white;
    border-radius: 12px;
    transition: all 0.25s ease;
  }

  .back:hover,
  .team-name:hover,
  .btn-outline.sm:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  }

  .content {
    max-width: 820px;
    margin: 0 auto;
    padding: 36px 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .form-card h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 6px;
    margin-top: 14px;
    color: var(--text);
  }

  .optional {
    font-weight: 400;
    color: var(--text-muted);
  }

  textarea {
    resize: vertical;
  }

  .mood-picker {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .mood-btn {
    padding: 6px 10px;
    font-size: 1.2rem;
    background: var(--bg);
    border: 2px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .mood-btn.selected {
    border-color: var(--accent);
    background: var(--accent-light);
  }

  .submitted-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .row-gap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .edit-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .locked-label {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .counter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .count-badge {
    background: var(--accent-light);
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .unsub {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .feed {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .standup-card {
    border-left: 4px solid var(--border);
    padding: 24px;
    border-radius: 16px;
  }

  .standup-card.has-blocker {
    border-left-color: #f97316;
    background: #fff7ed;
  }

  body.dark .standup-card.has-blocker {
    background: #2c1a0e;
  }

  .s-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .s-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .s-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .s-name {
    font-weight: 600;
    color: var(--text);
  }

  .mood-display {
    font-size: 1.1rem;
  }

  .streak-badge {
    background: var(--accent-light);
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
  }

  .late-badge {
    background: #fef3c7;
    color: #92400e;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
  }

  body.dark .late-badge {
    background: #451a03;
    color: #fbbf24;
  }

  .blocker-badge {
    background: #fed7aa;
    color: #c2410c;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
  }

  body.dark .blocker-badge {
    background: #431407;
    color: #fb923c;
  }

  .resolved-badge {
    background: #dcfce7;
    color: #166534;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
  }

  body.dark .resolved-badge {
    background: #052e16;
    color: #4ade80;
  }

  .s-row {
    font-size: 0.9rem;
    margin-top: 8px;
    color: var(--text);
    line-height: 1.5;
  }

  .s-row .label {
    font-weight: 600;
    color: var(--text-muted);
    margin-right: 4px;
  }

  .blocker-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .reactions {
    display: flex;
    gap: 6px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .react-btn {
    padding: 4px 10px;
    font-size: 0.85rem;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 999px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .react-btn.reacted {
    border-color: var(--accent);
    background: var(--accent-light);
  }

  .react-count {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .summary-text {
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.85rem;
    background: var(--bg);
    padding: 16px;
    border-radius: 8px;
    line-height: 1.7;
    color: var(--text);
  }

  .admin-card h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .admin-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .admin-row label {
    margin: 0;
  }

  .members-list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .member-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
  }

  .danger {
    border-color: #ef4444;
    color: #ef4444;
  }

  @media (max-width: 640px) {
    .topbar {
      padding: 14px 16px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .team-name {
      font-size: 0.95rem;
      padding: 8px 12px;
    }

    .back {
      padding: 8px 12px;
    }
  }

  @media print {
    .page > *:not(.content) {
      display: none;
    }

    .content > *:not(.summary-card) {
      display: none;
    }

    .summary-card {
      box-shadow: none;
      border: none;
    }

    button {
      display: none;
    }
  }
`]
})

export class TeamFeedComponent implements OnInit {
  teamId!: string;
  teamName = '';
  feedData: any = null;
  myStandup: any = null;
  summary = '';
  editing = false;
  copied = false;
  submitting = false;
  submitError = '';
  streaks: Record<string, number> = {};
  isAdmin = false;
  currentUserId = '';
  currentInviteCode = '';
  allMembers: any[] = [];
  dueTime = '';

  moods = MOODS;
  reactionEmojis = ['👍', '🔥', '👀'];
  form = { doneYesterday: '', doingToday: '', blockers: '', mood: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private standupService: StandupService,
    private teamService: TeamService,
    private auth: AuthService,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras.state as any || history.state;
    this.teamId = state?.teamId || this.route.snapshot.paramMap.get('teamId')!;
    this.teamName = this.route.snapshot.paramMap.get('teamId')!;
    this.currentUserId = this.auth.getUser()?.id;
    this.loadFeed();
    this.loadStreaks();
  }

  loadFeed() {
    this.standupService.getToday(this.teamId).subscribe(data => {
      this.feedData = data;
      if (data.teamName) this.teamName = data.teamName;
      this.myStandup = data.standups.find((s: any) => s.userId._id === this.currentUserId) ?? null;
      this.isAdmin = data.createdBy?.toString() === this.currentUserId;
      this.dueTime = data.dueTime || '';
      this.currentInviteCode = data.inviteCode || '';
      this.allMembers = data.standups.map((s: any) => s.userId).concat(data.unsubmitted);
    });
    this.standupService.getSummary(this.teamId).subscribe(r => this.summary = r.summary);
  }

  loadStreaks() {
    this.standupService.getStreaks(this.teamId).subscribe(s => this.streaks = s);
  }

  submit() {
    this.submitError = ''; this.submitting = true;
    this.standupService.submit({ teamId: this.teamId, ...this.form }).subscribe({
      next: () => { this.submitting = false; this.loadFeed(); },
      error: e => { this.submitError = e.error?.message || 'Submit failed'; this.submitting = false; }
    });
  }

  canEdit() {
    if (!this.myStandup) return false;
    return Date.now() - new Date(this.myStandup.submittedAt).getTime() < 2 * 24 * 3600000;
  }

  startEdit() {
    this.form = { doneYesterday: this.myStandup.doneYesterday, doingToday: this.myStandup.doingToday, blockers: this.myStandup.blockers, mood: this.myStandup.mood || '' };
    this.editing = true;
  }

  update() {
    this.submitting = true;
    this.standupService.update(this.myStandup._id, this.form).subscribe({
      next: () => { this.submitting = false; this.editing = false; this.loadFeed(); },
      error: () => { this.submitting = false; }
    });
  }

  copy() {
    navigator.clipboard.writeText(this.summary).then(() => { this.copied = true; setTimeout(() => this.copied = false, 2000); });
  }

  exportCsv() {
    if (!this.feedData) return;
    const rows = [['Name', 'Mood', 'Done Yesterday', 'Doing Today', 'Blockers', 'Late']];
    for (const s of this.feedData.standups)
      rows.push([s.userId.name, s.mood || '', s.doneYesterday, s.doingToday, s.blockers, s.isLate ? 'Yes' : 'No']);
    const csv = rows.map(r => r.map(v => `"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `standup-${this.feedData.date}.csv`;
    a.click();
  }

  exportPdf() { window.print(); }

  react(standup: any, emoji: string) {
    this.standupService.react(standup._id, emoji).subscribe(reactions => standup.reactions = reactions);
  }

  hasReacted(standup: any, emoji: string) {
    return standup.reactions?.some((r: any) => r.emoji === emoji && r.userId === this.currentUserId);
  }

  reactionCount(standup: any, emoji: string) {
    return standup.reactions?.filter((r: any) => r.emoji === emoji).length || 0;
  }

  resolveBlocker(standup: any) {
    this.standupService.resolveBlocker(standup._id).subscribe(updated => {
      standup.blockerResolved = updated.blockerResolved;
    });
  }

  regenerateCode() {
    this.teamService.regenerateCode(this.teamId).subscribe(r => this.currentInviteCode = r.inviteCode);
  }

  saveDueTime() {
    this.teamService.updateSettings(this.teamId, this.dueTime).subscribe();
  }

  removeMember(member: any) {
    if (!confirm(`Remove ${member.name} from this team?`)) return;
    this.teamService.removeMember(this.teamId, member._id).subscribe(() => {
      this.allMembers = this.allMembers.filter(m => m._id !== member._id);
    });
  }
}
