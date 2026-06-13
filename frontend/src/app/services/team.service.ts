import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:5000/api/team';

@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private http: HttpClient) {}

  getMyTeams() { return this.http.get<any[]>(`${API}/my`); }
  create(name: string) { return this.http.post<any>(`${API}/create`, { name }); }
  join(inviteCode: string) { return this.http.post<any>(`${API}/join`, { inviteCode }); }
  getMembers(teamId: string) { return this.http.get<any[]>(`${API}/${teamId}/members`); }
  removeMember(teamId: string, userId: string) { return this.http.delete<any>(`${API}/${teamId}/members/${userId}`); }
  regenerateCode(teamId: string) { return this.http.post<any>(`${API}/${teamId}/regenerate-code`, {}); }
  updateSettings(teamId: string, dueTime: string) { return this.http.put<any>(`${API}/${teamId}/settings`, { dueTime }); }
}
