import { effect, signal } from '@angular/core';

interface Analytics {
  track(event: string, properties: Record<string, string>): void;
}

export class AnalyticsViewModel {
  readonly selectedTab = signal('overview');

  constructor(private readonly analytics: Analytics) {
    effect(() => {
      this.analytics.track('profile_tab_viewed', {
        tab: this.selectedTab(),
      });
    });
  }
}
