import { effect, signal } from '@angular/core';

export class FocusViewModel {
  readonly shouldFocusSearch = signal(false);

  constructor() {
    effect(() => {
      if (!this.shouldFocusSearch()) {
        return;
      }

      document.querySelector<HTMLInputElement>('#search')?.focus();
    });
  }
}
