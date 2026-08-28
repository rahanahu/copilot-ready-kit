import { effect, signal } from '@angular/core';

export class TitleViewModel {
  readonly projectName = signal('Untitled');

  constructor() {
    effect(() => {
      document.title = `${this.projectName()} · Console`;
    });
  }
}
