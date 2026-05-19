import { Component, ElementRef, computed, inject, input, output } from '@angular/core'
import { LucideArrowDown, LucideArrowUp, LucideChevronsUpDown } from '@lucide/angular'
import { TranslatePipe } from '../../../pipes/translate-pipe'
import { TableColumn, SortState } from '../../../interfaces/data-table'

export interface ResizeStartEvent {
  key:          string
  clientX:      number
  currentWidth: number
}

@Component({
  selector: 'th[app-data-table-header]',
  imports: [LucideArrowDown, LucideArrowUp, LucideChevronsUpDown, TranslatePipe],
  templateUrl: './data-table-header.html',
  styleUrl: './data-table-header.css',
  host: {
    'class': 'th',
    '[class.th--sortable]': 'column().sortable',
    '[class.th--active]':   'isActive()',
    '[style.width]':        'width()',
    '(click)':              'onSort()',
  },
})
export class DataTableHeader<T> {
  private readonly el = inject(ElementRef<HTMLElement>)

  readonly column      = input.required<TableColumn<T>>()
  readonly sortState   = input<SortState | null>(null)
  readonly width       = input<string>('auto')
  readonly resizable   = input<boolean>(true)
  readonly sorted      = output<string>()
  readonly resizeStart = output<ResizeStartEvent>()

  readonly isActive = computed(() => this.sortState()?.key === this.column().key)
  readonly dir      = computed(() => this.isActive() ? this.sortState()!.dir : null)

  onSort(): void {
    if (this.column().sortable) this.sorted.emit(this.column().key)
  }

  onResizeStart(e: PointerEvent): void {
    e.stopPropagation()
    e.preventDefault()
    this.resizeStart.emit({
      key:          this.column().key,
      clientX:      e.clientX,
      currentWidth: this.el.nativeElement.offsetWidth,
    })
  }
}
