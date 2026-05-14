import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly _titlePage = signal<string>('Sole');
  private readonly _sidebarCollapsed = signal<boolean>(false);

  readonly titlePage = this._titlePage.asReadonly();
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  setTitle(title: string): void{
    this._titlePage.set(title);
  }

  toggleSidebar(): void{
    this._sidebarCollapsed.update(v => !v)
  }
}
