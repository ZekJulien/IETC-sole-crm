import { Component, OnInit, inject } from '@angular/core'
import { LucidePercent, LucidePlus } from '@lucide/angular'
import { VatRateDto } from '@shared/dtos/vat-rate'
import { VatRateStore } from '@app/stores/vat-rate'
import { Button, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CrudSettingsPage } from '../../../../shared/crud-settings-page'
import { VatRateFormModal, VatRateFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-vat-rate-settings',
  imports: [DataTable, Button, ConfirmDialog, VatRateFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './vat-rate-settings.html',
  styleUrl: './vat-rate-settings.css',
})
export class VatRateSettings extends CrudSettingsPage<VatRateDto> implements OnInit {
  readonly store = inject(VatRateStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucidePercent

  readonly columns: TableColumn<VatRateDto>[] = [
    { key: 'label',     labelKey: 'vatRate.label',          sortable: true },
    { key: 'rate',      labelKey: 'vatRate.rateColumn',     sortable: true, width: '160px' },
    { key: 'isDefault', labelKey: 'vatRate.isDefaultShort', type: 'boolean', width: '140px' },
  ]

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  async onSubmit(value: VatRateFormValue): Promise<void> {
    const editing = this.editing()
    const result = editing
      ? await this.store.update({ id: editing.id, ...value })
      : await this.store.add(value)
    if (result) this.closeModal()
  }
}
