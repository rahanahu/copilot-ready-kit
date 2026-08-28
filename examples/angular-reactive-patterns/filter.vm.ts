import { computed, signal } from '@angular/core';

interface Product {
  id: string;
  name: string;
}

export class FilterViewModel {
  readonly products = signal<Product[]>([]);
  readonly query = signal('');

  readonly filteredProducts = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.products().filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  });
}
