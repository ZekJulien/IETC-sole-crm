import { Component, computed, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { VatRateDto } from '@shared/dtos/vat-rate'
import { Button, FormField, Modal, Switch } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'

export interface VatRateFormValue {
  label:     string
  rate:      number
  isDefault: boolean
}

@Component({
  selector: 'app-vat-rate-form-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, Switch, TranslatePipe],
  templateUrl: './vat-rate-form-modal.html',
  styleUrl: './vat-rate-form-modal.css',
})
export class VatRateFormModal {
  private readonly fb = inject(FormBuilder)

  readonly open    = input<boolean>(false)
  readonly vatRate = input<VatRateDto | null>(null)
  readonly saving  = input<boolean>(false)

  readonly submitted = output<VatRateFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant

  readonly form = this.fb.nonNullable.group({
    label:     ['', [Validators.required]],
    rate:      [21, [Validators.required, Validators.min(0), Validators.max(100)]],
    isDefault: [false],
  })

  readonly isEdit   = computed(() => !!this.vatRate())
  readonly titleKey = computed(() => this.isEdit() ? 'vatRate.modal.editTitle' : 'vatRate.modal.createTitle')

  get labelControl() { return this.form.controls.label }
  get rateControl()  { return this.form.controls.rate }
  get isDefault()    { return this.form.controls.isDefault.value }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const r = this.vatRate()
      this.form.reset({
        label:     r?.label     ?? '',
        rate:      r?.rate      ?? 21,
        isDefault: r?.isDefault ?? false,
      })
    })
  }

  toggleDefault(): void {
    this.form.controls.isDefault.setValue(!this.form.controls.isDefault.value)
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.submitted.emit(this.form.getRawValue())
  }
}
