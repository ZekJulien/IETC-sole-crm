import { Component, computed, input, output } from '@angular/core'
import { LucideArrowDown, LucideArrowUp, LucideChevronsUpDown } from '@lucide/angular'
import { TranslatePipe } from '../../../pipes/translate-pipe'
import { TableColumn, SortState } from '../../../interfaces/data-table'

@Component({
  selector: 'app-data-table-header',
  imports: [LucideArrowDown, LucideArrowUp, LucideChevronsUpDown, TranslatePipe],
  templateUrl: './data-table-header.html',
  styleUrl: './data-table-header.css',
})
export class DataTableHeader<T> {
  readonly column    = input.required<TableColumn<T>>()
  readonly sortState = input<SortState | null>(null)
  readonly sorted    = output<string>()

  readonly isActive = computed(() => this.sortState()?.key === this.column().key)
  readonly dir      = computed(() => this.isActive() ? this.sortState()!.dir : null)

  onSort(): void {
    if (this.column().sortable) this.sorted.emit(this.column().key)
  }
}
