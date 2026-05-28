import { Component, OnInit, inject } from '@angular/core'
import { LucideReceipt, LucidePlus } from '@lucide/angular'
import { ExpenseCategoryDto } from '@shared/dtos/expense-category'
import { ExpenseCategoryStore } from '@app/stores/expense-category'
import { Button, SearchBar, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CrudSettingsPage } from '../../../../shared/crud-settings-page'
import { ExpenseCategoryFormModal, ExpenseCategoryFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-expense-category-settings',
  imports: [SearchBar, DataTable, Button, ConfirmDialog, ExpenseCategoryFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './expense-category-settings.html',
  styleUrl: './expense-category-settings.css',
})
export class ExpenseCategorySettings extends CrudSettingsPage<ExpenseCategoryDto> implements OnInit {
  readonly store = inject(ExpenseCategoryStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucideReceipt

  readonly columns: TableColumn<ExpenseCategoryDto>[] = [
    { key: 'color',      labelKey: 'expenseCategory.color',      type: 'color', width: '150px' },
    { key: 'name',       labelKey: 'expenseCategory.name',       sortable: true },
    { key: 'deductible', labelKey: 'expenseCategory.deductibleShort', type: 'boolean', width: '130px' },
    { key: 'createdAt',  labelKey: 'common.createdAt',           sortable: true, type: 'date', width: '150px' },
  ]

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  onSearch(term: string): void {
    this.store.load(term ? { search: term } : undefined)
  }

  async onSubmit(value: ExpenseCategoryFormValue): Promise<void> {
    const editing = this.editing()
    const result = editing
      ? await this.store.update({ id: editing.id, ...value })
      : await this.store.add(value)
    if (result) this.closeModal()
  }
}
