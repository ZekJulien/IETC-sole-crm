import { Component, computed, input, output, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { StatusBadge } from '../status-badge/status-badge'
import { DataTableHeader } from './data-table-header/data-table-header'
import { TableColumn, SortState } from '../../interfaces/data-table'

@Component({
  selector: 'app-data-table',
  imports: [DataTableHeader, StatusBadge, TranslatePipe, DatePipe],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T extends object> {
  readonly columns  = input.required<TableColumn<T>[]>()
  readonly data     = input.required<T[]>()
  readonly loading  = input<boolean>(false)
  readonly rowClick = output<T>()

  private readonly _sort = signal<SortState | null>(null)
  readonly sortState     = this._sort.asReadonly()

  readonly sortedData = computed(() => {
    const sort = this._sort()
    const rows = [...this.data()]
    if (!sort) return rows
    const key = sort.key
    return rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[key]
      const bv = (b as Record<string, unknown>)[key]
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  })

  onSort(key: string): void {
    const current = this._sort()
    if (current?.key === key)
      this._sort.set(current.dir === 'asc' ? { key, dir: 'desc' } : null)
    else
      this._sort.set({ key, dir: 'asc' })
  }

  getValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key]
  }

  getDateValue(row: T, key: string): string | number | Date | null {
    const val = (row as Record<string, unknown>)[key]
    if (val instanceof Date || typeof val === 'string' || typeof val === 'number') return val
    return null
  }
}
