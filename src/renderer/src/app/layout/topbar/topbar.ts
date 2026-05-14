import { Component, inject } from '@angular/core'
import { LayoutService } from '../../services/layout/layout.service'

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly layout = inject(LayoutService)
  readonly titlePage = this.layout.titlePage

  toggleSidebar(): void {
    this.layout.toggleSidebar()
  }
}
