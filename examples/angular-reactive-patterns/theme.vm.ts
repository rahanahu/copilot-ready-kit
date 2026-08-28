import { effect, signal } from '@angular/core';

export class ThemeViewModel {
  readonly theme = signal<'light' | 'dark'>('light');

  constructor() {
    effect(() => {
      const theme = this.theme();
      localStorage.setItem('theme', theme);
      document.documentElement.dataset['theme'] = theme;
      document.documentElement.style.colorScheme = theme;
    });
  }
}
