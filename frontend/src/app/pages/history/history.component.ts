import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StandupService } from '../../services/standup.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <nav class="topbar">
  <a [routerLink]="['/team', teamName]" [state]="{ teamId: teamId }" class="back">
    ‹ Today's Feed
  </a>

  <div class="nav-right">
    <div class="history-badge">
      <span class="title-icon">📅</span>
      <span class="title">History</span>
    </div>

    <button class="btn-outline sm icon-btn" (click)="theme.toggle()">
      {{ theme.isDark() ? '☀️' : '🌙' }}
    </button>
  </div>
</nav>

      <div class="content">
        <div class="date-row">
          <label>Select date</label>
          <input type="date" [(ngModel)]="selectedDate" (change)="load()" [max]="today" />
          <button class="btn-outline sm" (click)="loadWeeklyDigest()">📊 Weekly Digest</button>
        </div>

        <div class="info-note">Edit window is 2 days from submission. Past revisions appear below when available.</div>

        <div class="empty" *ngIf="feedData && feedData.standups.length === 0 && !weeklyMode">
          No standups found for this date.
        </div>

        <div class="feed" *ngIf="feedData && feedData.standups.length > 0 && !weeklyMode">
          <div class="standup-card card" *ngFor="let s of feedData.standups">
            <div class="s-header">
              <div>
                <h4>👤 {{ s.userId.name }} {{ s.mood ? s.mood : '' }}</h4>
                <div class="edit-note" *ngIf="s.edits?.length">
                  Edited {{ s.edits.length }} time{{ s.edits.length === 1 ? '' : 's' }}
                </div>
              </div>
              <span class="history-date">{{ formatDate(s.submittedAt) || selectedDate }}</span>
            </div>
            <div class="s-row"><span class="label">✅ Done:</span> {{ s.doneYesterday || '—' }}</div>
            <div class="s-row"><span class="label">🎯 Today:</span> {{ s.doingToday || '—' }}</div>
            <div class="s-row" *ngIf="s.blockers?.trim()"><span class="label">⚠️ Blocker:</span> {{ s.blockers }}</div>
            <div class="edit-history" *ngIf="s.edits?.length">
              <div class="edit-title">Previous standups</div>
              <div class="edit-card" *ngFor="let edit of s.edits; let i = index">
                <div class="edit-meta">Version {{ s.edits.length - i }} · {{ formatDate(edit.updatedAt) }}</div>
                <div class="s-row"><span class="label">✅ Done:</span> {{ edit.doneYesterday || '—' }}</div>
                <div class="s-row"><span class="label">🎯 Today:</span> {{ edit.doingToday || '—' }}</div>
                <div class="s-row" *ngIf="edit.blockers?.trim()"><span class="label">⚠️ Blocker:</span> {{ edit.blockers }}</div>
                <div class="s-row" *ngIf="edit.mood"><span class="label">😊 Mood:</span> {{ edit.mood }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card summary-card" *ngIf="summary">
          <div class="summary-header">
            <h3>{{ weeklyMode ? '📊 Weekly Digest' : '📋 Compiled Summary' }}</h3>
            <div class="row-gap">
              <button class="btn-outline sm" (click)="exportCsv()" [disabled]="!feedData?.standups?.length">⬇️ CSV</button>
              <button class="btn-outline sm" (click)="exportPdf()" [disabled]="!summary">📄 PDF</button>
              <button class="btn-primary sm" (click)="copy()">{{ copied ? '✅ Copied!' : '📋 Copy' }}</button>
            </div>
          </div>
          <pre class="summary-text">{{ summary }}</pre>
        </div>
      </div>
    </div>
  `,
 

  styles: [`
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

  

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .history-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;
}

  .title-icon {
    font-size: 1.15rem;
  }

  .title {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    letter-spacing: 0.4px;
  }

  .sm {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

 .icon-btn {
  width: 40px;
  height: 40px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.8) !important;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transition: all 0.25s ease;
}

  
.back:hover,
.history-badge:hover,
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}



  .content {
    max-width: 760px;
    margin: 0 auto;
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .date-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .date-row label {
    font-weight: 500;
    white-space: nowrap;
    color: var(--text);
    margin: 0;
  }

  .date-row input {
    max-width: 180px;
  }

  .info-note {
    font-size: 0.9rem;
    color: var(--text-muted);
    background: rgba(148, 163, 184, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.16);
    padding: 10px 14px;
    border-radius: 12px;
    margin-top: 8px;
  }

  .edit-note {
    font-size: 0.85rem;
    margin-top: 6px;
    color: var(--text);
  }

  .edit-note.no-edits {
    color: var(--text-muted);
  }

  .empty {
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    padding: 40px;
  }

  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .row-gap {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .edit-history {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .edit-title {
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--text);
  }

  .edit-card {
    padding: 14px;
    border-radius: 14px;
    background: rgba(148, 163, 184, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.18);
    margin-bottom: 12px;
  }

  .edit-card:last-child {
    margin-bottom: 0;
  }

  .edit-meta {
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text-muted);
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

  @media (max-width: 640px) {
    .topbar {
      padding: 14px 16px;
    }

    .history-badge {
      padding: 6px 10px;
    }

    .title {
      font-size: 0.95rem;
    }
  }

  @media print {
    button { display: none; }
    .topbar { display: none; }
    .date-row { display: none; }
  }
`]
  
})
export class HistoryComponent implements OnInit {
  teamId!: string;
  teamName!: string;
  selectedDate = '';
  today = '';
  yesterday = '';
  feedData: any = null;
  summary = '';
  copied = false;
  weeklyMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private standupService: StandupService,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras.state as any || history.state;
    this.teamName = this.route.snapshot.paramMap.get('teamId')!;
    this.teamId = state?.teamId || this.teamName;
    const d = new Date();
    this.today = d.toISOString().slice(0, 10);
    const y = new Date(d); y.setDate(d.getDate() - 1);
    this.yesterday = y.toISOString().slice(0, 10);
    this.selectedDate = this.today;
    this.load();
  }

  load() {
    this.weeklyMode = false;
    if (!this.selectedDate) return;
    this.standupService.getHistory(this.teamId, this.selectedDate).subscribe(d => {
      this.feedData = d;
      if (this.feedData?.standups) {
        this.feedData.standups = this.feedData.standups.map((s: any) => ({
          ...s,
          edits: s.edits?.slice().reverse() || []
        }));
      }
    });
    this.standupService.getSummary(this.teamId, this.selectedDate).subscribe(r => this.summary = r.summary);
  }

  loadWeeklyDigest() {
    this.weeklyMode = true;
    this.feedData = null;
    this.standupService.getWeeklyDigest(this.teamId).subscribe(r => this.summary = r.summary);
  }

  formatDate(value: string | Date | undefined) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    const timezone = date.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ').pop();
    return timezone ? `${formattedDate} ${timezone}` : formattedDate;
  }

  copy() {
    navigator.clipboard.writeText(this.summary).then(() => { this.copied = true; setTimeout(() => this.copied = false, 2000); });
  }

  exportCsv() {
    if (!this.feedData) return;
    const rows = [['Name', 'Mood', 'Done Yesterday', 'Doing Today', 'Blockers']];
    for (const s of this.feedData.standups)
      rows.push([s.userId.name, s.mood || '', s.doneYesterday, s.doingToday, s.blockers]);
    const csv = rows.map(r => r.map(v => `"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `standup-${this.selectedDate}.csv`;
    a.click();
  }

  exportPdf() { window.print(); }
}
