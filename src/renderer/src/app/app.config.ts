import { ApplicationConfig, ErrorHandler, provideZonelessChangeDetection } from '@angular/core'
import { GlobalErrorHandler } from './core/handlers/global-error.handler'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
}
