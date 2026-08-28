import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';

export class CountViewModel {
  readonly count: Signal<number>;

  constructor(items$: Observable<readonly string[]>) {
    this.count = toSignal(items$.pipe(map((items) => items.length)), {
      initialValue: 0,
    });
  }
}
