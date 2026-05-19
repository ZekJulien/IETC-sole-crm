import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'
import { I18nService } from '../../../services/i18n/i18n'
import { TranslatePipe } from '../../pipes/translate-pipe'

export type ViewFieldType = 'text' | 'email' | 'tel' | 'textarea'

@Component({
  selector: 'app-view-field',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './view-field.html',
  styleUrl: './view-field.css',
})
export class ViewField {
  private readonly i18n = inject(I18nService)

  readonly label           = input<string>('')
  readonly editing         = input<boolean>(false)
  readonly control         = input<AbstractControl | null>(null)
  readonly value           = input<string | number | null>(null)
  readonly type            = input<ViewFieldType>('text')
  readonly placeholderKey  = input<string>('common.notDefined')
  readonly patternErrorKey = input<string>('pattern')

  readonly changed = output<void>()

  private readonly tick = signal(0)

  constructor() {
    effect((onCleanup) => {
      const ctrl = this.control()
      if (!ctrl) return
      const sub = ctrl.events.subscribe(() => this.tick.update(t => t + 1))
      onCleanup(() => sub.unsubscribe())
    })
  }

  readonly hasValue = computed(() => {
    const v = this.value()
    return v !== null && v !== undefined && v !== ''
  })

  readonly errorMessage = computed<string | null>(() => {
    this.tick()
    const ctrl = this.control()
    if (!ctrl?.invalid || !ctrl.touched) return null
    const e = ctrl.errors
    if (e?.['required'])  return this.i18n.t('required')
    if (e?.['email'])     return this.i18n.t('email')
    if (e?.['minlength']) return this.i18n.t('minlength', { min: e['minlength'].requiredLength })
    if (e?.['maxlength']) return this.i18n.t('maxlength', { max: e['maxlength'].requiredLength })
    if (e?.['pattern'])   return this.i18n.t(this.patternErrorKey())
    return this.i18n.t('unknown')
  })
}
