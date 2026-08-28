import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

type Event = { name: string };
type Analytics = { track(event: Event): void };

export class TelemetryBridge {
  constructor(events$: Observable<Event>, analytics: Analytics, destroyRef: DestroyRef) {
    events$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event) => analytics.track(event));
  }
}
