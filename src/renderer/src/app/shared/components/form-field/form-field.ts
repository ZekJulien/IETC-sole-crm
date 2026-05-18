import { Component, computed, inject, input } from '@angular/core'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'
import { I18nService } from '../../../services/i18n/i18n'

@Component({
  selector: 'app-form-field',
  imports: [ReactiveFormsModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
})
export class FormField {
  private readonly i18n = inject(I18nService)

  readonly label       = input.required<string>()
  readonly type        = input<string>('text')
  readonly placeholder = input<string>('')
  readonly control     = input<AbstractControl | null>(null)

  readonly errorMessage = computed(() => {
    const ctrl = this.control()
    if (!ctrl?.invalid || !ctrl.touched) return null
    const e = ctrl.errors
    if (e?.['required'])  return this.i18n.t('required')
    if (e?.['email'])     return this.i18n.t('email')
    if (e?.['minlength']) return this.i18n.t('minlength', { min: e['minlength'].requiredLength })
    if (e?.['maxlength']) return this.i18n.t('maxlength', { max: e['maxlength'].requiredLength })
    return this.i18n.t('unknown')
  })
}
