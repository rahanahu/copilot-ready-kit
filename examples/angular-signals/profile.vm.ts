import { effect, signal } from '@angular/core';

export class ProfileViewModel {
  readonly firstName = signal('Ada');
  readonly lastName = signal('Lovelace');
  readonly theme = signal<'light' | 'dark'>('light');

  readonly fullName = signal('');

  constructor() {
    effect(() => {
      this.fullName.set(`${this.firstName()} ${this.lastName()}`);
    });

    effect(() => {
      const theme = this.theme();
      localStorage.setItem('theme', theme);
      document.documentElement.dataset['theme'] = theme;
    });
  }
}
