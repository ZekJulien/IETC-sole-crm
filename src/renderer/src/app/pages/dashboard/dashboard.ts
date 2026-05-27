import { Component, OnInit, computed, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop } from '@angular/cdk/drag-drop'
import {
  LucideEuro, LucideWallet, LucideFileText, LucideClock, LucideReceiptText,
  LucideUsers, LucideFolderKanban, LucideReceiptEuro, LucideGripVertical, LucideRotateCcw, LucideTimer,
} from '@lucide/angular'
import { TranslatePipe } from '@app/pipes'
import { I18nService } from '@app/services/i18n/i18n'
import { DashboardStore, DashboardWidgetId } from '@app/stores/dashboard'
import { PomodoroStore } from '@app/stores/pomodoro'
import { AppRoutes } from '@app/core/routes/app-routes.const'
import { formatCurrency } from '@app/utils'
import { KpiCard, BarChart, DonutChart, BarsChart, PipelineChart } from './components'
import type { ChartSeries } from './components/bar-chart/bar-chart'
import type { DonutItem } from './components/donut-chart/donut-chart'
import type { BarItem } from './components/bars-chart/bars-chart'
import type { PipelineRow } from './components/pipeline-chart/pipeline-chart'

interface StatusDef { key: string; i18n: string; color: string }

const QUOTE_STATUSES: StatusDef[] = [
  { key: 'DRAFT',    i18n: 'quote.status.draft',    color: 'var(--color-text-subtle)' },
  { key: 'SENT',     i18n: 'quote.status.sent',     color: 'var(--color-info)' },
  { key: 'ACCEPTED', i18n: 'quote.status.accepted', color: 'var(--color-success)' },
  { key: 'REJECTED', i18n: 'quote.status.rejected', color: 'var(--color-danger)' },
  { key: 'EXPIRED',  i18n: 'quote.status.expired',  color: 'var(--color-warning)' },
]

const INVOICE_STATUSES: StatusDef[] = [
  { key: 'DRAFT',     i18n: 'invoice.status.draft',     color: 'var(--color-text-subtle)' },
  { key: 'SENT',      i18n: 'invoice.status.sent',      color: 'var(--color-info)' },
  { key: 'PAID',      i18n: 'invoice.status.paid',      color: 'var(--color-success)' },
  { key: 'OVERDUE',   i18n: 'invoice.status.overdue',   color: 'var(--color-danger)' },
  { key: 'CANCELLED', i18n: 'invoice.status.cancelled', color: 'var(--color-border-soft)' },
]

const TITLES: Record<DashboardWidgetId, string> = {
  'note':                    'dashboard.widget.note',
  'actions':                 'dashboard.widget.actions',
  'kpi-revenue':             'dashboard.kpi.revenue',
  'kpi-unpaid':              'dashboard.kpi.unpaid',
  'kpi-quotes':              'dashboard.kpi.quotes',
  'kpi-hours':               'dashboard.kpi.hours',
  'kpi-deductible':          'dashboard.kpi.deductible',
  'chart-revenue-expenses':  'dashboard.widget.revenueExpenses',
  'chart-pipeline':          'dashboard.widget.pipeline',
  'chart-expenses-category': 'dashboard.widget.expensesCategory',
  'chart-hours-project':     'dashboard.widget.hoursProject',
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink, CdkDropList, CdkDrag, CdkDragHandle, TranslatePipe,
    LucideEuro, LucideWallet, LucideFileText, LucideClock, LucideReceiptText,
    LucideUsers, LucideFolderKanban, LucideReceiptEuro, LucideGripVertical, LucideRotateCcw, LucideTimer,
    KpiCard, BarChart, DonutChart, BarsChart, PipelineChart,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  readonly store = inject(DashboardStore)
  readonly pomodoro = inject(PomodoroStore)
  private readonly i18n = inject(I18nService)

  readonly spans = [1, 2, 3]
  readonly formatCurrency = formatCurrency
  readonly formatCompact = (n: number): string =>
    new Intl.NumberFormat(this.i18n.locale(), {
      notation: 'compact', style: 'currency', currency: 'EUR', maximumFractionDigits: 1,
    }).format(n)
  readonly formatHours = (minutes: number): string => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h && m) return `${h}h${String(m).padStart(2, '0')}`
    if (h)      return `${h}h`
    return `${m}m`
  }

  readonly routes = {
    quoteNew:   '/' + AppRoutes.paths.quoteNew,
    invoiceNew: '/' + AppRoutes.paths.invoiceNew,
    projectNew: '/' + AppRoutes.paths.projectNew,
    clients:    AppRoutes.nav.clients,
    expenses:   AppRoutes.nav.expenses,
  }

  readonly monthLabels = computed<string[]>(() => {
    const fmt = new Intl.DateTimeFormat(this.i18n.locale(), { month: 'short' })
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2020, m, 1)))
  })

  readonly revenueExpensesSeries = computed<ChartSeries[]>(() => [
    { label: this.t('dashboard.chart.revenue'),  color: 'var(--color-success)', values: this.store.revenueByMonth() },
    { label: this.t('dashboard.chart.expenses'), color: 'var(--color-danger)',  values: this.store.expensesByMonth() },
  ])

  readonly expenseCategoryItems = computed<DonutItem[]>(() => {
    const sums = this.store.expensesByCategory()
    return this.store.categories()
      .map(c => ({ label: c.name, value: sums[c.id] ?? 0, color: c.color }))
      .filter(i => i.value > 0)
  })

  readonly hoursProjectItems = computed<BarItem[]>(() => {
    const sums = this.store.hoursByProject()
    return this.store.projects().map(p => ({ label: p.name, value: sums[p.id] ?? 0 }))
  })

  readonly pipelineRows = computed<PipelineRow[]>(() => {
    const q   = this.store.quoteCounts()
    const inv = this.store.invoiceCounts()
    return [
      { label: this.t('dashboard.pipeline.quotes'),   segments: QUOTE_STATUSES.map(s => ({ label: this.t(s.i18n), value: q[s.key] ?? 0, color: s.color })) },
      { label: this.t('dashboard.pipeline.invoices'), segments: INVOICE_STATUSES.map(s => ({ label: this.t(s.i18n), value: inv[s.key] ?? 0, color: s.color })) },
    ]
  })

  readonly quotesPending = computed(() => this.store.quoteCounts()['SENT'] ?? 0)

  readonly acceptanceRate = computed<number | null>(() => {
    const q        = this.store.quoteCounts()
    const accepted = q['ACCEPTED'] ?? 0
    const decided  = accepted + (q['REJECTED'] ?? 0) + (q['EXPIRED'] ?? 0)
    return decided > 0 ? Math.round((accepted / decided) * 100) : null
  })

  readonly quotesHint = computed(() => {
    const rate = this.acceptanceRate()
    return rate === null ? this.t('dashboard.kpi.noDecided') : this.t('dashboard.kpi.acceptance', { rate })
  })

  readonly deductibleHint = computed(() => this.t('dashboard.kpi.deductibleHint', { year: this.store.year() }))

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  titleKey(id: DashboardWidgetId): string {
    return TITLES[id]
  }

  isChart(id: DashboardWidgetId): boolean {
    return id.startsWith('chart-')
  }

  onDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex !== event.currentIndex)
      this.store.reorder(event.previousIndex, event.currentIndex)
  }

  onNote(event: Event): void {
    this.store.setNote((event.target as HTMLTextAreaElement).value)
  }

  private t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params)
  }
}
