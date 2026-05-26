import { ApplicationConfig, ErrorHandler, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router'
import { GlobalErrorHandler } from './core/handlers/global-error.handler'
import { I18nService } from '@app/services/i18n/i18n'
import { CompanyStore } from '@app/stores/company/company-store'
import { WizardService } from '@app/services/wizard/wizard'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(async () => {
      const i18n    = inject(I18nService)
      const company = inject(CompanyStore)
      const wizard  = inject(WizardService)
      await i18n.init()
      await company.load()
      if (!company.isConfigured()) wizard.start()
    }),
  ]
}
