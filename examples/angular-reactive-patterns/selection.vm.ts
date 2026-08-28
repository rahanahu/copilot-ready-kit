import { computed, signal } from '@angular/core';

interface Project {
  id: string;
  name: string;
}

export class SelectionViewModel {
  readonly projects = signal<Project[]>([]);
  readonly selectedProjectId = signal<string | null>(null);

  readonly selectedProject = computed(() => {
    const selectedId = this.selectedProjectId();
    return this.projects().find((project) => project.id === selectedId) ?? null;
  });
}
