import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../api';

const API_URL = `${API}/standup`;

@Injectable({ providedIn: 'root' })
export class StandupService {
  constructor(private http: HttpClient) {}

  submit(data: any) { return this.http.post<any>(`${API_URL}`, data); }
  update(id: string, data: any) { return this.http.put<any>(`${API_URL}/${id}`, data); }
  getToday(teamId: string) { return this.http.get<any>(`${API_URL}/${teamId}/today`); }
  getHistory(teamId: string, date: string) { return this.http.get<any>(`${API_URL}/${teamId}/history?date=${date}`); }
  getSummary(teamId: string, date?: string) { return this.http.get<any>(`${API_URL}/${teamId}/summary${date ? '?date=' + date : ''}`); }
  getWeeklyDigest(teamId: string) { return this.http.get<any>(`${API_URL}/${teamId}/weekly-digest`); }
  react(id: string, emoji: string) { return this.http.post<any>(`${API_URL}/${id}/react`, { emoji }); }
  resolveBlocker(id: string) { return this.http.patch<any>(`${API_URL}/${id}/resolve-blocker`, {}); }
  getStreaks(teamId: string) { return this.http.get<any>(`${API_URL}/${teamId}/streaks`); }
}
