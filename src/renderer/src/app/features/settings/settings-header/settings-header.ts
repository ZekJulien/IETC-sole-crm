import { Component, Type, input } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { LucideBuilding2, LucideTags, LucideReceipt } from '@lucide/angular'
import { TranslatePipe } from '@app/pipes'
import { AppRoutes } from '@app/core/routes/app-routes.const'

@Component({
  selector: 'app-settings-header',
  imports: [NgComponentOutlet, RouterLink, RouterLinkActive, LucideBuilding2, LucideTags, LucideReceipt, TranslatePipe],
  templateUrl: './settings-header.html',
  styleUrl: './settings-header.css',
})
export class SettingsHeader {
  readonly icon     = input.required<Type<unknown>>()
  readonly title    = input.required<string>()
  readonly subtitle = input<string>('')

  readonly companyRoute           = AppRoutes.nav.settingsCompany
  readonly categoriesRoute        = AppRoutes.nav.settingsCategories
  readonly expenseCategoriesRoute = AppRoutes.nav.settingsExpenseCategories
}
