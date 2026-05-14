import { Injectable, inject } from '@angular/core'
import { ToastService } from '../toast/toast.service'
import { ErrorContext } from '../../models'

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly toast = inject(ToastService)

  handle(error: Error | string, context?: ErrorContext): void {
    const message = error instanceof Error ? error.message : error
    const stack   = error instanceof Error ? error.stack   : undefined

    if (!context?.silent) {
      this.toast.error(message, { title: context?.title })
    }

    window.logService.error(message, stack)
  }
}
