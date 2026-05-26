import { Injectable, inject, signal } from '@angular/core'
import { SeedService } from '@app/services/seed/seed'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class SeedStore {
  private readonly seedSvc = inject(SeedService)
  private readonly toast   = inject(ToastService)
  private readonly errors  = inject(ErrorService)
  private readonly i18n    = inject(I18nService)

  private readonly _busy = signal<boolean>(false)
  readonly busy = this._busy.asReadonly()

  seedDemo(): Promise<boolean> {
    return this.run(() => this.seedSvc.demo(), 'seed.toast.demo')
  }

  seedEmpty(): Promise<boolean> {
    return this.run(() => this.seedSvc.requiredDefaults(), 'seed.toast.empty')
  }

  reset(): Promise<boolean> {
    return this.run(() => this.seedSvc.reset(), 'seed.toast.reset')
  }

  private async run(fn: () => Promise<void>, successKey: string): Promise<boolean> {
    this._busy.set(true)
    try {
      await fn()
      this.toast.success(this.i18n.t(successKey))
      return true
    } catch (e) { this.errors.handle(e); return false }
    finally    { this._busy.set(false) }
  }
}
