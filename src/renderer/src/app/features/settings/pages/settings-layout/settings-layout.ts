import { Component } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { LucideBuilding2, LucideTags, LucideReceipt, LucidePercent, LucidePackage, LucideLanguages } from '@lucide/angular'
import { NavItem } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { AppRoutes } from '@app/core/routes/app-routes.const'

@Component({
  selector: 'app-settings-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgComponentOutlet, TranslatePipe],
  templateUrl: './settings-layout.html',
  styleUrl: './settings-layout.css',
})
export class SettingsLayout {
  readonly tabs: NavItem[] = [
    { route: AppRoutes.nav.settingsCompany,           labelKey: 'settings.tab.company',           icon: LucideBuilding2 },
    { route: AppRoutes.nav.settingsCategories,        labelKey: 'settings.tab.categories',        icon: LucideTags },
    { route: AppRoutes.nav.settingsExpenseCategories, labelKey: 'settings.tab.expenseCategories', icon: LucideReceipt },
    { route: AppRoutes.nav.settingsVatRates,          labelKey: 'settings.tab.vatRates',          icon: LucidePercent },
    { route: AppRoutes.nav.settingsProducts,          labelKey: 'settings.tab.products',          icon: LucidePackage },
    { route: AppRoutes.nav.settingsPreferences,       labelKey: 'settings.tab.preferences',       icon: LucideLanguages },
  ]
}
