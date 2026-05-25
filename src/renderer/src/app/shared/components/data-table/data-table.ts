import { Component, ElementRef, HostListener, computed, effect, input, output, signal, viewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { LucideCheck } from '@lucide/angular'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { StatusBadge } from '../status-badge/status-badge'
import { DataTableHeader, ResizeStartEvent } from './data-table-header/data-table-header'
import { TableColumn, SortState, TableTag } from '../../interfaces/data-table'
import { formatCurrency } from '../../utils'

const MIN_COL_WIDTH = 60

@Component({
  selector: 'app-data-table',
  imports: [DataTableHeader, StatusBadge, TranslatePipe, DatePipe, LucideCheck],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T extends object> {
  readonly columns  = input.required<TableColumn<T>[]>()
  readonly data     = input.required<T[]>()
  readonly loading  = input<boolean>(false)
  readonly rowClick = output<T>()

  private readonly tableWrap = viewChild<ElementRef<HTMLElement>>('tableWrap')
  private readonly tableEl   = viewChild<ElementRef<HTMLTableElement>>('tableEl')

  private readonly _sort = signal<SortState | null>(null)
  readonly sortState     = this._sort.asReadonly()

  readonly hasInitialized = signal<boolean>(false)

  readonly columnWidths = signal<Record<string, number>>({})
  private resizingKey:    string | null = null
  private neighborKey:    string | null = null
  private neighborIsLast = false
  private resizeStartX   = 0
  private resizeStartW   = 0
  private neighborStartW = 0

  readonly sortedData = computed(() => {
    const sort = this._sort()
    const rows = [...this.data()]
    if (!sort) return rows
    const key = sort.key
    return rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[key]
      const bv = (b as Record<string, unknown>)[key]
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  })

  readonly formatCurrency = formatCurrency

  constructor() {
    effect(() => {
      if (!this.loading() && this.data().length > 0 && !this.hasInitialized()) {
        this.hasInitialized.set(true)
      }
    })

    effect((onCleanup) => {
      const table = this.tableEl()?.nativeElement
      const wrap  = this.tableWrap()?.nativeElement
      if (!table || !wrap) return

      const sync = () => wrap.style.setProperty('--table-height', table.offsetHeight + 'px')
      const observer = new ResizeObserver(sync)
      observer.observe(table)
      sync()
      onCleanup(() => observer.disconnect())
    })
  }

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

  getTags(row: T, key: string): TableTag[] {
    const val = (row as Record<string, unknown>)[key]
    return Array.isArray(val) ? val as TableTag[] : []
  }

  getColumnWidth(col: TableColumn<T>, isLast: boolean): string {
    if (isLast && Object.keys(this.columnWidths()).length > 0) return 'auto'
    const stored = this.columnWidths()[col.key]
    if (stored) return stored + 'px'
    return col.width ?? 'auto'
  }

  onResizeStart(e: ResizeStartEvent): void {
    const table = this.tableEl()?.nativeElement
    if (!table) return

    const cols = this.columns()
    const lastIndex = cols.length - 1
    const rects = Array.from(table.querySelectorAll<HTMLElement>('thead th'))
      .map(th => th.getBoundingClientRect().width)

    const widths: Record<string, number> = {}
    cols.forEach((c, i) => { if (i < lastIndex) widths[c.key] = rects[i] })
    this.columnWidths.set(widths)

    const idx = cols.findIndex(c => c.key === e.key)
    this.resizingKey    = e.key
    this.neighborKey    = cols[idx + 1]?.key ?? null
    this.neighborIsLast = idx + 1 === lastIndex
    this.resizeStartX   = e.clientX
    this.resizeStartW   = rects[idx] ?? e.currentWidth
    this.neighborStartW = rects[idx + 1] ?? 0
  }

  @HostListener('window:pointermove', ['$event'])
  onResizeMove(e: PointerEvent): void {
    if (!this.resizingKey || !this.neighborKey) return
    e.preventDefault()

    const maxGrow   = this.neighborStartW - MIN_COL_WIDTH
    const maxShrink = this.resizeStartW   - MIN_COL_WIDTH
    const delta = Math.max(-maxShrink, Math.min(maxGrow, e.clientX - this.resizeStartX))

    const key = this.resizingKey, nKey = this.neighborKey
    this.columnWidths.update(w => {
      const next = { ...w, [key]: this.resizeStartW + delta }
      if (!this.neighborIsLast) next[nKey] = this.neighborStartW - delta
      return next
    })
  }

  @HostListener('window:pointerup')
  onResizeEnd(): void {
    this.resizingKey = null
    this.neighborKey = null
  }
}
