import { Component, inject } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { LucideUsers } from '@lucide/angular'
import { LayoutService } from '@app/services/layout/layout.service'
import { TranslatePipe } from '@app/pipes'
import { NavItem } from '@app/interfaces'
import { AppRoutes } from '@app/core/routes/app-routes.const'

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgComponentOutlet, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly layout = inject(LayoutService)
  readonly collapsed = this.layout.sidebarCollapsed

  readonly navItems: NavItem[] = [
    { labelKey: 'nav.clients', route: AppRoutes.nav.clients, icon: LucideUsers },
  ]
}
