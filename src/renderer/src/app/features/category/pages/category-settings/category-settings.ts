import { Component, OnInit, inject } from '@angular/core'
import { LucideTags, LucidePlus } from '@lucide/angular'
import { CategoryDto } from '@shared/dtos/category'
import { CategoryStore } from '@app/stores/category'
import { Button, SearchBar, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CrudSettingsPage } from '../../../../shared/crud-settings-page'
import { CategoryFormModal, CategoryFormValue } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-category-settings',
  imports: [SearchBar, DataTable, Button, ConfirmDialog, CategoryFormModal, SettingsHeader, TranslatePipe, LucidePlus],
  templateUrl: './category-settings.html',
  styleUrl: './category-settings.css',
})
export class CategorySettings extends CrudSettingsPage<CategoryDto> implements OnInit {
  readonly store = inject(CategoryStore)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucideTags

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

  async onSubmit(value: CategoryFormValue): Promise<void> {
    const editing = this.editing()
    const result = editing
      ? await this.store.update({ id: editing.id, ...value })
      : await this.store.add(value)
    if (result) this.closeModal()
  }
}
