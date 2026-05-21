import { Component, OnInit, inject, signal } from '@angular/core'
import { LucideTags, LucidePlus } from '@lucide/angular'
import { CategoryDto } from '@shared/dtos/category'
import { CategoryStore } from '@app/stores/category'
import { Button, SearchBar, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CategoryFormModal, CategoryFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-category-settings',
  imports: [SearchBar, DataTable, Button, ConfirmDialog, CategoryFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './category-settings.html',
  styleUrl: './category-settings.css',
})
export class CategorySettings implements OnInit {
  readonly store = inject(CategoryStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucideTags

  readonly modalOpen   = signal(false)
  readonly editing     = signal<CategoryDto | null>(null)
  readonly confirmOpen = signal(false)

  readonly columns: TableColumn<CategoryDto>[] = [
    { key: 'color',     labelKey: 'category.color',   type: 'color', width: '150px' },
    { key: 'name',      labelKey: 'category.name',    sortable: true },
    { key: 'createdAt', labelKey: 'common.createdAt', sortable: true, type: 'date', width: '150px' },
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

  openEdit(category: CategoryDto): void {
    this.editing.set(category)
    this.modalOpen.set(true)
  }

  closeModal(): void {
    this.modalOpen.set(false)
    this.editing.set(null)
  }

  async onSubmit(value: CategoryFormValue): Promise<void> {
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
