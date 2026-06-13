import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark = false;

  constructor() {
    this.dark = localStorage.getItem('theme') === 'dark';
    this.apply();
  }

  toggle() {
    this.dark = !this.dark;
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    this.apply();
  }

  isDark() { return this.dark; }

  private apply() {
    document.body.classList.toggle('dark', this.dark);
  }
}
