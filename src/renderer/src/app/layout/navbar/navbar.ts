import { Component } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { LucideLayoutDashboard, LucideUsers, LucideFolderKanban, LucideListTodo, LucideClock, LucideSettings, LucideUserCircle2 } from '@lucide/angular'
import { TranslatePipe } from '@app/pipes'
import { NavItem } from '@app/interfaces'
import { AppRoutes } from '@app/core/routes/app-routes.const'

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgComponentOutlet, LucideSettings, LucideUserCircle2, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly settingsRoute = AppRoutes.nav.settings

  readonly navItems: NavItem[] = [
    { labelKey: 'nav.dashboard', route: AppRoutes.nav.home,     icon: LucideLayoutDashboard, exact: true },
    { labelKey: 'nav.clients',   route: AppRoutes.nav.clients,  icon: LucideUsers },
    { labelKey: 'nav.projects',  route: AppRoutes.nav.projects, icon: LucideFolderKanban },
    { labelKey: 'nav.tasks',     route: AppRoutes.nav.tasks,    icon: LucideListTodo },
    { labelKey: 'nav.time',      route: AppRoutes.nav.time,     icon: LucideClock },
  ]
}
