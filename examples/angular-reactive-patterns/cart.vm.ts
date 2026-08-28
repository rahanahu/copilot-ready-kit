import { computed, signal } from '@angular/core';

interface LineItem {
  quantity: number;
  unitPriceCents: number;
}

export class CartViewModel {
  readonly items = signal<LineItem[]>([]);

  readonly totalCents = computed(() =>
    this.items().reduce(
      (total, item) => total + item.quantity * item.unitPriceCents,
      0,
    ),
  );
}
