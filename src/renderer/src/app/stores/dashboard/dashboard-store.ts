import { Injectable, computed, inject, signal } from '@angular/core'
import { InvoiceService } from '@app/services/invoice/invoice'
import { QuoteService } from '@app/services/quote/quote'
import { ExpenseService } from '@app/services/expense/expense'
import { TimeEntryService } from '@app/services/time-entry/time-entry'
import { ProjectStore } from '@app/stores/project'
import { ExpenseCategoryStore } from '@app/stores/expense-category'
import { CompanyService } from '@app/services/company/company'
import { ErrorService } from '@app/services/error/error.service'

export type DashboardWidgetId =
  | 'note' | 'actions'
  | 'kpi-revenue' | 'kpi-unpaid' | 'kpi-quotes' | 'kpi-hours' | 'kpi-deductible'
  | 'chart-revenue-expenses' | 'chart-pipeline' | 'chart-expenses-category' | 'chart-hours-project'

export interface DashboardWidget {
  id:   DashboardWidgetId
  span: number
}

const DEFAULT_LAYOUT: DashboardWidget[] = [
  { id: 'note',                    span: 2 },
  { id: 'actions',                 span: 1 },
  { id: 'kpi-revenue',             span: 1 },
  { id: 'kpi-unpaid',              span: 1 },
  { id: 'kpi-quotes',              span: 1 },
  { id: 'kpi-hours',               span: 1 },
  { id: 'kpi-deductible',          span: 1 },
  { id: 'chart-revenue-expenses',  span: 3 },
  { id: 'chart-pipeline',          span: 1 },
  { id: 'chart-expenses-category', span: 1 },
  { id: 'chart-hours-project',     span: 1 },
]

const LAYOUT_KEY = 'sole.dashboard.layout'
const NOTE_DEBOUNCE_MS = 500

function clampSpan(span: number): number {
  return Math.min(3, Math.max(1, Math.round(span) || 1))
}

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly invoiceSvc   = inject(InvoiceService)
  private readonly quoteSvc     = inject(QuoteService)
  private readonly expenseSvc   = inject(ExpenseService)
  private readonly timeSvc      = inject(TimeEntryService)
  private readonly projectStore = inject(ProjectStore)
  private readonly categoryStore = inject(ExpenseCategoryStore)
  private readonly companySvc   = inject(CompanyService)
  private readonly errors       = inject(ErrorService)

  private noteTimer: ReturnType<typeof setTimeout> | null = null

  private readonly _stats              = signal<{ unpaid: number; revenueThisMonth: number }>({ unpaid: 0, revenueThisMonth: 0 })
  private readonly _invoiceCounts      = signal<Record<string, number>>({})
  private readonly _quoteCounts        = signal<Record<string, number>>({})
  private readonly _revenueByMonth     = signal<number[]>([])
  private readonly _expensesByMonth    = signal<number[]>([])
  private readonly _expensesByCategory = signal<Record<number, number>>({})
  private readonly _deductibleThisYear = signal<number>(0)
  private readonly _hoursThisMonth     = signal<number>(0)
  private readonly _hoursByProject     = signal<Record<number, number>>({})
  private readonly _year               = signal<number>(new Date().getFullYear())
  private readonly _loading            = signal<boolean>(false)
  private readonly _note               = signal<string>('')
  private readonly _layout             = signal<DashboardWidget[]>(this.readLayout())

  readonly stats              = this._stats.asReadonly()
  readonly invoiceCounts      = this._invoiceCounts.asReadonly()
  readonly quoteCounts        = this._quoteCounts.asReadonly()
  readonly revenueByMonth     = this._revenueByMonth.asReadonly()
  readonly expensesByMonth    = this._expensesByMonth.asReadonly()
  readonly expensesByCategory = this._expensesByCategory.asReadonly()
  readonly deductibleThisYear = this._deductibleThisYear.asReadonly()
  readonly hoursThisMonth     = this._hoursThisMonth.asReadonly()
  readonly hoursByProject     = this._hoursByProject.asReadonly()
  readonly year               = this._year.asReadonly()
  readonly loading            = this._loading.asReadonly()
  readonly note               = this._note.asReadonly()
  readonly layout             = this._layout.asReadonly()
  readonly projects           = this.projectStore.projects
  readonly categories         = this.categoryStore.categories
  readonly isCustomized       = computed(() => localStorage.getItem(LAYOUT_KEY) !== null)

  async load(): Promise<void> {
    this._loading.set(true)
    try {
      const year  = new Date().getFullYear()
      const month = new Date().getMonth() + 1
      this._year.set(year)
      const [
        stats, invoiceCounts, quoteCounts, revenueByMonth,
        expensesByMonth, expensesByCategory, deductible, hoursThisMonth, hoursByProject, note,
      ] = await Promise.all([
        this.invoiceSvc.getStats(),
        this.invoiceSvc.countByStatus(),
        this.quoteSvc.countByStatus(),
        this.invoiceSvc.sumPaymentsByMonth(year),
        this.expenseSvc.sumByMonth(year),
        this.expenseSvc.sumByCategory(),
        this.expenseSvc.sumDeductible(year),
        this.timeSvc.sumByMonth(year, month),
        this.timeSvc.sumByProject(),
        this.companySvc.getDashboardNote(),
      ])
      await Promise.all([this.projectStore.load(), this.categoryStore.load()])
      this._stats.set(stats)
      this._invoiceCounts.set(invoiceCounts)
      this._quoteCounts.set(quoteCounts)
      this._revenueByMonth.set(revenueByMonth)
      this._expensesByMonth.set(expensesByMonth)
      this._expensesByCategory.set(expensesByCategory)
      this._deductibleThisYear.set(deductible)
      this._hoursThisMonth.set(hoursThisMonth)
      this._hoursByProject.set(hoursByProject)
      this._note.set(note)
    } catch (e) {
      this.errors.handle(e)
    } finally {
      this._loading.set(false)
    }
  }

  setNote(value: string): void {
    this._note.set(value)
    if (this.noteTimer) clearTimeout(this.noteTimer)
    this.noteTimer = setTimeout(() => {
      void this.companySvc.setDashboardNote(value).catch(e => this.errors.handle(e))
    }, NOTE_DEBOUNCE_MS)
  }

  setSpan(id: DashboardWidgetId, span: number): void {
    this._layout.update(list => list.map(w => w.id === id ? { ...w, span: clampSpan(span) } : w))
    this.persistLayout()
  }

  reorder(previousIndex: number, currentIndex: number): void {
    this._layout.update(list => {
      const next = [...list]
      const [moved] = next.splice(previousIndex, 1)
      next.splice(currentIndex, 0, moved)
      return next
    })
    this.persistLayout()
  }

  resetLayout(): void {
    this._layout.set(DEFAULT_LAYOUT.map(w => ({ ...w })))
    localStorage.removeItem(LAYOUT_KEY)
  }

  private persistLayout(): void {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(this._layout()))
  }

  private readLayout(): DashboardWidget[] {
    try {
      const raw = localStorage.getItem(LAYOUT_KEY)
      if (!raw) return DEFAULT_LAYOUT.map(w => ({ ...w }))
      const parsed = JSON.parse(raw) as DashboardWidget[]
      const known  = new Set(DEFAULT_LAYOUT.map(w => w.id))
      const seen   = new Set<DashboardWidgetId>()
      const result: DashboardWidget[] = []
      for (const w of parsed) {
        if (w && known.has(w.id) && !seen.has(w.id)) {
          result.push({ id: w.id, span: clampSpan(w.span) })
          seen.add(w.id)
        }
      }
      for (const w of DEFAULT_LAYOUT) if (!seen.has(w.id)) result.push({ ...w })
      return result
    } catch {
      return DEFAULT_LAYOUT.map(w => ({ ...w }))
    }
  }
}
