import { effect, signal } from '@angular/core';

export class PaginationViewModel {
  readonly totalItems = signal(0);
  readonly pageSize = signal(25);
  readonly page = signal(1);

  private readonly _pageCount = signal(1);
  readonly pageCount = this._pageCount.asReadonly();

  private readonly _hasNextPage = signal(false);
  readonly hasNextPage = this._hasNextPage.asReadonly();

  constructor() {
    effect(() => {
      const pageCount = Math.max(
        1,
        Math.ceil(this.totalItems() / this.pageSize()),
      );
      this._pageCount.set(pageCount);
      this._hasNextPage.set(this.page() < pageCount);
    });
  }
}
