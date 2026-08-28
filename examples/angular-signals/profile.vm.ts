import { computed, effect, signal } from '@angular/core';

export class ProfileViewModel {
  readonly firstName = signal('Ada');
  readonly lastName = signal('Lovelace');
  readonly theme = signal<'light' | 'dark'>('light');

  readonly fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

  constructor() {
    effect(() => {
      localStorage.setItem('theme', this.theme());
    });
  }
}
