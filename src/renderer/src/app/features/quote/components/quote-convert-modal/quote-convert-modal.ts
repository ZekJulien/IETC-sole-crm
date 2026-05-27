import { Component, computed, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { toSignal } from '@angular/core/rxjs-interop'
import { QuoteDto } from '@shared/dtos/quote'
import { ConvertQuoteDto } from '@shared/dtos/conversion'
import { Button, FormField, Modal, Switch } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency } from '@app/utils'
import { I18nService } from '@app/services/i18n/i18n'

@Component({
  selector: 'app-quote-convert-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, Switch, TranslatePipe],
  templateUrl: './quote-convert-modal.html',
  styleUrl: './quote-convert-modal.css',
})
export class QuoteConvertModal {
  private readonly fb   = inject(FormBuilder)
  private readonly i18n = inject(I18nService)

  readonly open   = input<boolean>(false)
  readonly quote  = input<QuoteDto | null>(null)
  readonly saving = input<boolean>(false)

  readonly confirmed = output<ConvertQuoteDto>()
  readonly cancelled = output<void>()

  readonly ButtonVariant  = ButtonVariant
  readonly formatCurrency = formatCurrency

  readonly form = this.fb.nonNullable.group({
    projectName:          ['', [Validators.required]],
    depositPercentage:    [30, [Validators.required, Validators.min(0), Validators.max(100)]],
    createDepositInvoice: [true],
  })

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() })

  readonly reusingProject  = computed(() => !!this.quote()?.projectId)
  readonly createInvoice   = computed(() => this.value().createDepositInvoice ?? true)
  readonly title           = computed(() => this.i18n.t('conversion.title', { number: this.quote()?.number ?? '' }))
  readonly depositAmount   = computed(() => {
    const pct = Number(this.value().depositPercentage) || 0
    return ((this.quote()?.totalTtc ?? 0) * pct) / 100
  })

  get projectNameControl()       { return this.form.controls.projectName }
  get depositPercentageControl() { return this.form.controls.depositPercentage }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const q = this.quote()
      this.form.reset({
        projectName:          q?.projectName ?? this.defaultProjectName(q),
        depositPercentage:    30,
        createDepositInvoice: true,
      })
    })
  }

  toggleInvoice(): void {
    this.form.controls.createDepositInvoice.setValue(!this.form.controls.createDepositInvoice.value)
  }

  submit(): void {
    const q = this.quote()
    if (!q || this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.getRawValue()
    this.confirmed.emit({
      quoteId:              q.id,
      projectName:          v.projectName.trim(),
      createDepositInvoice: v.createDepositInvoice,
      depositPercentage:    Number(v.depositPercentage),
      depositLabel:         this.i18n.t('conversion.depositLineLabel', { pct: v.depositPercentage, number: q.number }),
    })
  }

  private defaultProjectName(q: QuoteDto | null): string {
    return q ? this.i18n.t('conversion.projectNameDefault', { client: q.clientName }) : ''
  }
}
