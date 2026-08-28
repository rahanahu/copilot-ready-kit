import { effect, signal } from '@angular/core';

interface Product {
  id: string;
  name: string;
}

export class FilterViewModel {
  readonly products = signal<Product[]>([]);
  readonly query = signal('');

  private readonly _filteredProducts = signal<Product[]>([]);
  readonly filteredProducts = this._filteredProducts.asReadonly();

  constructor() {
    effect(() => {
      const query = this.query().trim().toLowerCase();
      this._filteredProducts.set(
        this.products().filter((product) =>
          product.name.toLowerCase().includes(query),
        ),
      );
    });
  }
}
