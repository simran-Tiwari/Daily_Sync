import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:5000/api/standup';

@Injectable({ providedIn: 'root' })
export class StandupService {
  constructor(private http: HttpClient) {}

  submit(data: any) { return this.http.post<any>(`${API}`, data); }
  update(id: string, data: any) { return this.http.put<any>(`${API}/${id}`, data); }
  getToday(teamId: string) { return this.http.get<any>(`${API}/${teamId}/today`); }
  getHistory(teamId: string, date: string) { return this.http.get<any>(`${API}/${teamId}/history?date=${date}`); }
  getSummary(teamId: string, date?: string) { return this.http.get<any>(`${API}/${teamId}/summary${date ? '?date=' + date : ''}`); }
  getWeeklyDigest(teamId: string) { return this.http.get<any>(`${API}/${teamId}/weekly-digest`); }
  react(id: string, emoji: string) { return this.http.post<any>(`${API}/${id}/react`, { emoji }); }
  resolveBlocker(id: string) { return this.http.patch<any>(`${API}/${id}/resolve-blocker`, {}); }
  getStreaks(teamId: string) { return this.http.get<any>(`${API}/${teamId}/streaks`); }
}
