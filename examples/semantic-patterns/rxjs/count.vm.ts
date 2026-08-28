import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';

export class CountViewModel {
  private readonly _count = signal(0);
  readonly count = this._count.asReadonly();

  constructor(items$: Observable<readonly string[]>, destroyRef: DestroyRef) {
    items$
      .pipe(
        map((items) => items.length),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((count) => this._count.set(count));
  }
}
