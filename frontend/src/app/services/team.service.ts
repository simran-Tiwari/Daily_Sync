import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../api';

const API_URL = `${API}/team`;

@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private http: HttpClient) {}

  getMyTeams() { return this.http.get<any[]>(`${API_URL}/my`); }
  create(name: string) { return this.http.post<any>(`${API_URL}/create`, { name }); }
  join(inviteCode: string) { return this.http.post<any>(`${API_URL}/join`, { inviteCode }); }
  getMembers(teamId: string) { return this.http.get<any[]>(`${API_URL}/${teamId}/members`); }
  removeMember(teamId: string, userId: string) { return this.http.delete<any>(`${API_URL}/${teamId}/members/${userId}`); }
  regenerateCode(teamId: string) { return this.http.post<any>(`${API_URL}/${teamId}/regenerate-code`, {}); }
  updateSettings(teamId: string, dueTime: string) { return this.http.put<any>(`${API_URL}/${teamId}/settings`, { dueTime }); }
}
