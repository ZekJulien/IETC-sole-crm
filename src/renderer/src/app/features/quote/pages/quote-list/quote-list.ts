import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { LucidePlus } from '@lucide/angular'
import { QuoteStatus } from '@shared/dtos/quote'
import { QuoteStore } from '@app/stores/quote'
import { ClientStore } from '@app/stores/client/client-store'
import { Button, SearchBar, DataTable } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency } from '@app/utils'
import { QUOTE_STATUSES, quoteStatusKey } from '../../utils/quote-status'

interface QuoteRow {
  id:         number
  number:     string
  clientName: string
  status:     QuoteStatus
  issueDate:  Date
  validUntil: Date
  total:      number
}

@Component({
  selector: 'app-quote-list',
  imports: [SearchBar, DataTable, Button, TranslatePipe, LucidePlus],
  templateUrl: './quote-list.html',
  styleUrl: './quote-list.css',
})
export class QuoteList implements OnInit {
  private readonly router = inject(Router)
  readonly store   = inject(QuoteStore)
  readonly clients = inject(ClientStore)

  readonly ButtonVariant  = ButtonVariant
  readonly formatCurrency = formatCurrency
  readonly statuses       = QUOTE_STATUSES
  readonly statusKey      = quoteStatusKey

  readonly searchTerm   = signal<string>('')
  readonly statusFilter = signal<QuoteStatus | ''>('')
  readonly clientFilter = signal<number | null>(null)

  readonly totalCount = computed(() =>
    Object.values(this.store.counts()).reduce((sum, n) => sum + n, 0)
  )

  count(status: QuoteStatus): number {
    return this.store.counts()[status] ?? 0
  }

  readonly rows = computed<QuoteRow[]>(() =>
    this.store.quotes().map(q => ({
      id:         q.id,
      number:     q.number,
      clientName: q.clientName,
      status:     q.status,
      issueDate:  q.issueDate,
      validUntil: q.validUntil,
      total:      q.totalTtc,
    }))
  )

  readonly columns: TableColumn<QuoteRow>[] = [
    { key: 'number',     labelKey: 'quote.number',      sortable: true, width: '150px' },
    { key: 'clientName', labelKey: 'quote.client',      sortable: true },
    { key: 'status',     labelKey: 'quote.statusLabel', type: 'badge', badgeI18nPrefix: 'quote.status.', width: '130px' },
    { key: 'issueDate',  labelKey: 'quote.issueDate',   type: 'date', sortable: true, width: '130px' },
    { key: 'validUntil', labelKey: 'quote.validUntil',  type: 'date', sortable: true, width: '130px' },
    { key: 'total',      labelKey: 'quote.total',       type: 'currency', sortable: true, width: '140px' },
  ]

  async ngOnInit(): Promise<void> {
    await Promise.all([this.store.load(), this.clients.load()])
  }

  onSearch(term: string): void {
    this.searchTerm.set(term)
    this.reload()
  }

  selectStatus(status: QuoteStatus | ''): void {
    this.statusFilter.set(status)
    this.reload()
  }

  onClientChange(value: string): void {
    this.clientFilter.set(value ? Number(value) : null)
    this.reload()
  }

  openCreate(): void {
    this.router.navigate(['/quotes/new'])
  }

  onRowClick(row: QuoteRow): void {
    this.router.navigate(['/quotes', row.id])
  }

  private reload(): void {
    const search = this.searchTerm().trim()
    this.store.load({ where: this.buildWhere(), search: search || undefined })
  }

  private buildWhere(): Record<string, unknown> | undefined {
    const where: Record<string, unknown> = {}
    const status = this.statusFilter()
    if (status) where['status'] = status
    const clientId = this.clientFilter()
    if (clientId) where['clientId'] = clientId
    return Object.keys(where).length ? where : undefined
  }
}
