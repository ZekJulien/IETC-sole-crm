import { Component, OnInit, inject, signal } from '@angular/core'
import { LucidePercent, LucidePlus } from '@lucide/angular'
import { VatRateDto } from '@shared/dtos/vat-rate'
import { VatRateStore } from '@app/stores/vat-rate'
import { Button, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { VatRateFormModal, VatRateFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-vat-rate-settings',
  imports: [DataTable, Button, ConfirmDialog, VatRateFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './vat-rate-settings.html',
  styleUrl: './vat-rate-settings.css',
})
export class VatRateSettings implements OnInit {
  readonly store = inject(VatRateStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucidePercent

  readonly modalOpen   = signal(false)
  readonly editing     = signal<VatRateDto | null>(null)
  readonly confirmOpen = signal(false)

  readonly columns: TableColumn<VatRateDto>[] = [
    { key: 'label',     labelKey: 'vatRate.label',          sortable: true },
    { key: 'rate',      labelKey: 'vatRate.rateColumn',     sortable: true, width: '160px' },
    { key: 'isDefault', labelKey: 'vatRate.isDefaultShort', type: 'boolean', width: '140px' },
  ]

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  openCreate(): void {
    this.editing.set(null)
    this.modalOpen.set(true)
  }

  openEdit(rate: VatRateDto): void {
    this.editing.set(rate)
    this.modalOpen.set(true)
  }

  closeModal(): void {
    this.modalOpen.set(false)
    this.editing.set(null)
  }

  async onSubmit(value: VatRateFormValue): Promise<void> {
    const editing = this.editing()
    const result = editing
      ? await this.store.update({ id: editing.id, ...value })
      : await this.store.add(value)
    if (result) this.closeModal()
  }

  async confirmDelete(): Promise<void> {
    const editing = this.editing()
    if (editing) await this.store.remove(editing.id)
    this.confirmOpen.set(false)
    this.closeModal()
  }
}
