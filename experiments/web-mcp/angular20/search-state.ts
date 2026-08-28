import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchState {
  readonly query = signal('');
  private persistedQuery = '';

  constructor() {
    effect(() => {
      this.persistedQuery = this.query();
    });
  }

  updateAndRead(query: string): string {
    this.query.set(query);
    return this.persistedQuery;
  }
}
