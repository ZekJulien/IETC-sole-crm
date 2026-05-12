import { ApplicationConfig, ErrorHandler, provideZonelessChangeDetection } from '@angular/core'
import { GlobalErrorHandler } from './core/global-error.handler'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
}
