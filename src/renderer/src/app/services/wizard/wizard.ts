import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class WizardService {
  private readonly _active = signal<boolean>(false)
  readonly active = this._active.asReadonly()

  start(): void { this._active.set(true) }
  finish(): void { this._active.set(false) }
}
