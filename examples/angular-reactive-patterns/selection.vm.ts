import { effect, signal } from '@angular/core';

interface Project {
  id: string;
  name: string;
}

export class SelectionViewModel {
  readonly projects = signal<Project[]>([]);
  readonly selectedProjectId = signal<string | null>(null);

  private readonly _selectedProject = signal<Project | null>(null);
  readonly selectedProject = this._selectedProject.asReadonly();

  constructor() {
    effect(() => {
      const selectedId = this.selectedProjectId();
      this._selectedProject.set(
        this.projects().find((project) => project.id === selectedId) ?? null,
      );
    });
  }
}
