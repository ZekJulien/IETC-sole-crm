import { Component, HostListener, computed, inject, signal } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router'
import { LucideLayoutDashboard, LucideUsers, LucideBriefcase, LucideFolderKanban, LucideListTodo, LucideClock, LucideBanknote, LucideFileText, LucideReceiptEuro, LucideWallet, LucideChevronDown, LucideSettings } from '@lucide/angular'
import { TranslatePipe } from '@app/pipes'
import { NavItem } from '@app/interfaces'
import { AppRoutes } from '@app/core/routes/app-routes.const'
import { PomodoroIndicator } from '../pomodoro-indicator/pomodoro-indicator'

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgComponentOutlet, LucideChevronDown, LucideSettings, TranslatePipe, PomodoroIndicator],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router)

  readonly settingsRoute = AppRoutes.nav.settings

  readonly navItems: NavItem[] = [
    { labelKey: 'nav.dashboard', route: AppRoutes.nav.home,    icon: LucideLayoutDashboard, exact: true },
    { labelKey: 'nav.clients',   route: AppRoutes.nav.clients, icon: LucideUsers },
  ]

  readonly groups: NavItem[] = [
    {
      labelKey: 'nav.work',
      icon: LucideBriefcase,
      children: [
        { labelKey: 'nav.projects', route: AppRoutes.nav.projects, icon: LucideFolderKanban },
        { labelKey: 'nav.tasks',    route: AppRoutes.nav.tasks,    icon: LucideListTodo },
        { labelKey: 'nav.time',     route: AppRoutes.nav.time,     icon: LucideClock },
      ],
    },
    {
      labelKey: 'nav.billing',
      icon: LucideBanknote,
      children: [
        { labelKey: 'nav.quotes',   route: AppRoutes.nav.quotes,   icon: LucideFileText },
        { labelKey: 'nav.invoices', route: AppRoutes.nav.invoices, icon: LucideReceiptEuro },
        { labelKey: 'nav.expenses', route: AppRoutes.nav.expenses, icon: LucideWallet },
      ],
    },
  ]

  readonly openMenu = signal<string | null>(null)

  private readonly url = signal<string>(this.router.url)
  readonly activeGroup = computed<string | null>(() => {
    const current = this.url()
    return this.groups.find(g => g.children?.some(c => !!c.route && current.startsWith(c.route)))?.labelKey ?? null
  })

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.url.set(event.urlAfterRedirects)
        this.openMenu.set(null)
      }
    })
  }

  toggleMenu(key: string, event: MouseEvent): void {
    event.stopPropagation()
    this.openMenu.update(current => current === key ? null : key)
  }

  closeMenu(): void {
    this.openMenu.set(null)
  }

  @HostListener('document:click')
  onOutsideClick(): void {
    this.openMenu.set(null)
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openMenu.set(null)
  }
}
