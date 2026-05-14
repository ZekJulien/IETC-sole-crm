import { Component, inject } from '@angular/core'
import { LayoutService } from '../../services/layout/layout.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly layout = inject(LayoutService)
  readonly collapsed = this.layout.sidebarCollapsed
}
