import { effect, signal } from '@angular/core';

export class TitleViewModel {
  readonly projectName = signal('Untitled');

  constructor() {
    effect(() => {
      const projectName = this.projectName();
      document.title = `${projectName} · Console`;
      document.documentElement.dataset['projectName'] = projectName;
    });
  }
}
