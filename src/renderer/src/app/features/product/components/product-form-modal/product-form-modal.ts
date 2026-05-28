import { Component, computed, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ProductDto } from '@shared/dtos/product'
import { VatRateDto } from '@shared/dtos/vat-rate'
import { DEFAULT_VAT_RATE } from '@shared/utils/vat-defaults'
import { Button, FormField, Modal } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'

export interface ProductFormValue {
  name:        string
  description: string
  unitPrice:   number
  vatRate:     number
  unit:        string
}

@Component({
  selector: 'app-product-form-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, TranslatePipe],
  templateUrl: './product-form-modal.html',
  styleUrl: './product-form-modal.css',
})
export class ProductFormModal {
  private readonly fb = inject(FormBuilder)

  readonly open     = input<boolean>(false)
  readonly product  = input<ProductDto | null>(null)
  readonly vatRates = input<VatRateDto[]>([])
  readonly saving   = input<boolean>(false)

  readonly submitted = output<ProductFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant

  readonly form = this.fb.nonNullable.group({
    name:        ['', [Validators.required]],
    description: [''],
    unitPrice:   [0, [Validators.required, Validators.min(0)]],
    vatRate:     [21, [Validators.required]],
    unit:        [''],
  })

  readonly isEdit      = computed(() => !!this.product())
  readonly titleKey    = computed(() => this.isEdit() ? 'product.modal.editTitle' : 'product.modal.createTitle')
  readonly defaultRate = computed(() =>
    this.vatRates().find(r => r.isDefault)?.rate ?? this.vatRates()[0]?.rate ?? DEFAULT_VAT_RATE
  )

  get nameControl()  { return this.form.controls.name }
  get priceControl() { return this.form.controls.unitPrice }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const p = this.product()
      this.form.reset({
        name:        p?.name        ?? '',
        description: p?.description  ?? '',
        unitPrice:   p?.unitPrice   ?? 0,
        vatRate:     p?.vatRate     ?? this.defaultRate(),
        unit:        p?.unit        ?? '',
      })
    })
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.submitted.emit(this.form.getRawValue())
  }
}
