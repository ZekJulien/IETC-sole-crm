import { ApplicationConfig, ErrorHandler, provideZonelessChangeDetection } from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router'
import { GlobalErrorHandler } from './core/handlers/global-error.handler'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
}
