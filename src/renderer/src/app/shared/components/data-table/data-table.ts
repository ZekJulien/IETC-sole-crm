import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, input, output, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { StatusBadge } from '../status-badge/status-badge'
import { DataTableHeader, ResizeStartEvent } from './data-table-header/data-table-header'
import { TableColumn, SortState } from '../../interfaces/data-table'

const MIN_COL_WIDTH = 60

@Component({
  selector: 'app-data-table',
  imports: [DataTableHeader, StatusBadge, TranslatePipe, DatePipe],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T extends object> implements AfterViewInit, OnDestroy {
  readonly columns  = input.required<TableColumn<T>[]>()
  readonly data     = input.required<T[]>()
  readonly loading  = input<boolean>(false)
  readonly rowClick = output<T>()

  @ViewChild('tableWrap') tableWrap?: ElementRef<HTMLElement>
  @ViewChild('tableEl')   tableEl?:   ElementRef<HTMLTableElement>

  private readonly _sort = signal<SortState | null>(null)
  readonly sortState     = this._sort.asReadonly()

  // Skeleton uniquement au tout premier chargement (latché à true dès qu'on a vu des data)
  readonly hasInitialized = signal<boolean>(false)

  constructor() {
    effect(() => {
      if (!this.loading() && this.data().length > 0 && !this.hasInitialized()) {
        this.hasInitialized.set(true)
      }
    })
  }

  // ── Resize des colonnes ──────────────────────────────
  readonly columnWidths = signal<Record<string, number>>({})
  private resizingKey: string | null = null
  private resizeStartX = 0
  private resizeStartW = 0
  private tableObserver?: ResizeObserver

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

  getColumnWidth(col: TableColumn<T>): string {
    const stored = this.columnWidths()[col.key]
    if (stored) return stored + 'px'
    return col.width ?? 'auto'
  }

  onResizeStart(e: ResizeStartEvent): void {
    this.resizingKey  = e.key
    this.resizeStartX = e.clientX
    this.resizeStartW = e.currentWidth
  }

  @HostListener('window:pointermove', ['$event'])
  onResizeMove(e: PointerEvent): void {
    if (!this.resizingKey) return
    e.preventDefault()
    const delta = e.clientX - this.resizeStartX

    // Clamp pour empêcher le crushing des autres colonnes
    // (max = largeur totale - place minimum requise par les autres colonnes)
    let maxWidth = Number.POSITIVE_INFINITY
    if (this.tableEl) {
      const tableWidth = this.tableEl.nativeElement.offsetWidth
      const otherCount = this.columns().length - 1
      maxWidth = Math.max(MIN_COL_WIDTH, tableWidth - otherCount * MIN_COL_WIDTH)
    }

    const next = Math.max(MIN_COL_WIDTH, Math.min(maxWidth, this.resizeStartW + delta))
    this.columnWidths.update(w => ({ ...w, [this.resizingKey!]: next }))
  }

  @HostListener('window:pointerup')
  onResizeEnd(): void { this.resizingKey = null }

  // ── Synchronise --table-height pour que les poignées de resize s'étendent
  //    sur toute la hauteur du tableau (visible et cliquable jusqu'en bas) ──
  ngAfterViewInit(): void {
    if (!this.tableEl || !this.tableWrap) return
    this.tableObserver = new ResizeObserver(() => this.syncTableHeight())
    this.tableObserver.observe(this.tableEl.nativeElement)
    this.syncTableHeight()
  }

  ngOnDestroy(): void {
    this.tableObserver?.disconnect()
  }

  private syncTableHeight(): void {
    if (!this.tableEl || !this.tableWrap) return
    this.tableWrap.nativeElement.style.setProperty(
      '--table-height',
      this.tableEl.nativeElement.offsetHeight + 'px',
    )
  }
}
