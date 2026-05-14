import { ErrorHandler, Injectable } from '@angular/core'

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const msg = error instanceof Error ? error.message : String(error)
    window.logService?.error(msg, error instanceof Error ? error.stack : '')
    console.error(error)
  }
}
