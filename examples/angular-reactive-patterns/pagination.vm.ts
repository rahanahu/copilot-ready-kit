import { computed, signal } from '@angular/core';

export class PaginationViewModel {
  readonly totalItems = signal(0);
  readonly pageSize = signal(25);
  readonly page = signal(1);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  readonly hasNextPage = computed(() => this.page() < this.pageCount());
}
