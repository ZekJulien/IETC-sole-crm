import { Component, OnInit, inject, signal } from '@angular/core'
import { LucideReceipt, LucidePlus } from '@lucide/angular'
import { ExpenseCategoryDto } from '@shared/dtos/expense-category'
import { ExpenseCategoryStore } from '@app/stores/expense-category'
import { Button, SearchBar, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { ExpenseCategoryFormModal, ExpenseCategoryFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-expense-category-settings',
  imports: [SearchBar, DataTable, Button, ConfirmDialog, ExpenseCategoryFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './expense-category-settings.html',
  styleUrl: './expense-category-settings.css',
})
export class ExpenseCategorySettings implements OnInit {
  readonly store = inject(ExpenseCategoryStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucideReceipt

  readonly modalOpen   = signal(false)
  readonly editing     = signal<ExpenseCategoryDto | null>(null)
  readonly confirmOpen = signal(false)

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

  openCreate(): void {
    this.editing.set(null)
    this.modalOpen.set(true)
  }

  openEdit(category: ExpenseCategoryDto): void {
    this.editing.set(category)
    this.modalOpen.set(true)
  }

  closeModal(): void {
    this.modalOpen.set(false)
    this.editing.set(null)
  }

  async onSubmit(value: ExpenseCategoryFormValue): Promise<void> {
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
