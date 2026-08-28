import { effect, signal } from '@angular/core';

interface LineItem {
  quantity: number;
  unitPriceCents: number;
}

export class CartViewModel {
  readonly items = signal<LineItem[]>([]);

  private readonly _totalCents = signal(0);
  readonly totalCents = this._totalCents.asReadonly();

  constructor() {
    effect(() => {
      this._totalCents.set(
        this.items().reduce(
          (total, item) => total + item.quantity * item.unitPriceCents,
          0,
        ),
      );
    });
  }
}
