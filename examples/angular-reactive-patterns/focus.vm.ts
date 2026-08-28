import { effect, signal } from '@angular/core';

export class FocusViewModel {
  readonly shouldFocusSearch = signal(false);

  constructor() {
    effect(() => {
      if (!this.shouldFocusSearch()) {
        return;
      }

      const input = document.querySelector<HTMLInputElement>('#search');
      input?.focus();
      input?.select();
    });
  }
}
