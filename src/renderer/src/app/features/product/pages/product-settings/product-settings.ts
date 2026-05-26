import { Component, OnInit, inject, signal } from '@angular/core'
import { LucidePackage, LucidePlus } from '@lucide/angular'
import { ProductDto } from '@shared/dtos/product'
import { ProductStore } from '@app/stores/product'
import { VatRateStore } from '@app/stores/vat-rate'
import { Button, SearchBar, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { ProductFormModal, ProductFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-product-settings',
  imports: [SearchBar, DataTable, Button, ConfirmDialog, ProductFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './product-settings.html',
  styleUrl: './product-settings.css',
})
export class ProductSettings implements OnInit {
  readonly store    = inject(ProductStore)
  readonly vatRates = inject(VatRateStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucidePackage

  readonly modalOpen   = signal(false)
  readonly editing     = signal<ProductDto | null>(null)
  readonly confirmOpen = signal(false)

  readonly columns: TableColumn<ProductDto>[] = [
    { key: 'name',      labelKey: 'product.name',         sortable: true },
    { key: 'unit',      labelKey: 'product.unit',         width: '120px' },
    { key: 'vatRate',   labelKey: 'product.vatRateShort', sortable: true, width: '120px' },
    { key: 'unitPrice', labelKey: 'product.unitPrice',    type: 'currency', sortable: true, width: '150px' },
  ]

  async ngOnInit(): Promise<void> {
    await Promise.all([this.store.load(), this.vatRates.load()])
  }

  onSearch(term: string): void {
    this.store.load(term ? { search: term } : undefined)
  }

  openCreate(): void {
    this.editing.set(null)
    this.modalOpen.set(true)
  }

  openEdit(product: ProductDto): void {
    this.editing.set(product)
    this.modalOpen.set(true)
  }

  closeModal(): void {
    this.modalOpen.set(false)
    this.editing.set(null)
  }

  async onSubmit(value: ProductFormValue): Promise<void> {
    const payload = {
      name:        value.name,
      description: value.description.trim() || null,
      unitPrice:   value.unitPrice,
      vatRate:     value.vatRate,
      unit:        value.unit.trim() || null,
    }
    const editing = this.editing()
    const result = editing
      ? await this.store.update({ id: editing.id, ...payload })
      : await this.store.add(payload)
    if (result) this.closeModal()
  }

  async confirmDelete(): Promise<void> {
    const editing = this.editing()
    if (editing) await this.store.remove(editing.id)
    this.confirmOpen.set(false)
    this.closeModal()
  }
}
