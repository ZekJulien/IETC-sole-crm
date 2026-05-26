import { Component, computed, inject, input } from '@angular/core'
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucidePlus, LucideTrash2 } from '@lucide/angular'
import { VatRateDto } from '@shared/dtos/vat-rate'
import { ProductDto } from '@shared/dtos/product'
import { Combobox } from '../combobox'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { formatCurrency } from '../../utils'

export interface LineItemValue {
  id:          number | null
  productId:   number | null
  description: string
  quantity:    number
  unitPrice:   number
  vatRate:     number
}

export function buildLineGroup(
  fb: FormBuilder,
  line?: Partial<LineItemValue>,
  defaultRate = 21,
): FormGroup {
  return fb.group({
    id:          [line?.id ?? null as number | null],
    productId:   [line?.productId ?? null as number | null],
    description: [line?.description ?? '', [Validators.required]],
    quantity:    [line?.quantity ?? 1, [Validators.required, Validators.min(0.01)]],
    unitPrice:   [line?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
    vatRate:     [line?.vatRate ?? defaultRate, [Validators.required]],
  })
}

@Component({
  selector: 'app-line-items-editor',
  imports: [ReactiveFormsModule, Combobox, TranslatePipe, LucidePlus, LucideTrash2],
  templateUrl: './line-items-editor.html',
  styleUrl: './line-items-editor.css',
})
export class LineItemsEditor {
  private readonly fb = inject(FormBuilder)

  readonly lines    = input.required<FormArray>()
  readonly vatRates = input<VatRateDto[]>([])
  readonly products = input<ProductDto[]>([])

  readonly formatCurrency = formatCurrency

  readonly productNames = computed(() => this.products().map(p => p.name))
  readonly defaultRate  = computed(() => this.vatRates().find(v => v.isDefault)?.rate ?? 21)

  addLine(): void {
    this.lines().push(buildLineGroup(this.fb, undefined, this.defaultRate()))
  }

  removeLine(index: number): void {
    this.lines().removeAt(index)
  }

  lineTotal(index: number): number {
    const { quantity, unitPrice } = this.lines().at(index).getRawValue()
    return (Number(quantity) || 0) * (Number(unitPrice) || 0)
  }

  onDescriptionInput(index: number, value: string): void {
    const ctrl = this.lines().at(index)
    ctrl.get('description')!.setValue(value)
    if (!this.products().some(p => p.name === value.trim())) {
      ctrl.get('productId')!.setValue(null)
    }
  }

  onDescriptionChange(index: number, value: string): void {
    const ctrl    = this.lines().at(index)
    const product = this.products().find(p => p.name === value.trim())
    if (!product) return
    ctrl.patchValue({
      description: product.name,
      productId:   product.id,
      unitPrice:   product.unitPrice,
      vatRate:     product.vatRate,
    })
  }
}
