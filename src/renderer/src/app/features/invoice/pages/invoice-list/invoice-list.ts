import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { LucidePlus } from '@lucide/angular'
import { InvoiceStatus } from '@shared/dtos/invoice'
import { InvoiceStore } from '@app/stores/invoice'
import { ClientStore } from '@app/stores/client/client-store'
import { Button, SearchBar, DataTable } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency } from '@app/utils'
import { INVOICE_STATUSES, invoiceStatusKey } from '../../utils/invoice-status'

interface InvoiceRow {
  id:         number
  number:     string
  clientName: string
  status:     InvoiceStatus
  issueDate:  Date
  dueDate:    Date
  total:      number
  balance:    number
}

@Component({
  selector: 'app-invoice-list',
  imports: [SearchBar, DataTable, Button, TranslatePipe, LucidePlus],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceList implements OnInit {
  private readonly router = inject(Router)
  readonly store   = inject(InvoiceStore)
  readonly clients = inject(ClientStore)

  readonly ButtonVariant  = ButtonVariant
  readonly formatCurrency = formatCurrency
  readonly statuses       = INVOICE_STATUSES
  readonly statusKey      = invoiceStatusKey

  readonly searchTerm   = signal<string>('')
  readonly statusFilter = signal<InvoiceStatus | ''>('')
  readonly clientFilter = signal<number | null>(null)

  readonly totalCount = computed(() =>
    Object.values(this.store.counts()).reduce((sum, n) => sum + n, 0)
  )

  count(status: InvoiceStatus): number {
    return this.store.counts()[status] ?? 0
  }

  readonly rows = computed<InvoiceRow[]>(() =>
    this.store.invoices().map(i => ({
      id:         i.id,
      number:     i.number,
      clientName: i.clientName,
      status:     i.status,
      issueDate:  i.issueDate,
      dueDate:    i.dueDate,
      total:      i.totalTtc,
      balance:    i.balanceDue,
    }))
  )

  readonly columns: TableColumn<InvoiceRow>[] = [
    { key: 'number',     labelKey: 'invoice.number',      sortable: true, width: '150px' },
    { key: 'clientName', labelKey: 'invoice.client',      sortable: true },
    { key: 'status',     labelKey: 'invoice.statusLabel', type: 'badge', badgeI18nPrefix: 'invoice.status.', width: '120px' },
    { key: 'issueDate',  labelKey: 'invoice.issueDate',   type: 'date', sortable: true, width: '120px' },
    { key: 'dueDate',    labelKey: 'invoice.dueDate',     type: 'date', sortable: true, width: '120px' },
    { key: 'total',      labelKey: 'invoice.total',       type: 'currency', sortable: true, width: '130px' },
    { key: 'balance',    labelKey: 'invoice.balance',     type: 'currency', sortable: true, width: '130px' },
  ]

  async ngOnInit(): Promise<void> {
    await Promise.all([this.store.load(), this.clients.load()])
  }

  onSearch(term: string): void {
    this.searchTerm.set(term)
    this.reload()
  }

  selectStatus(status: InvoiceStatus | ''): void {
    this.statusFilter.set(status)
    this.reload()
  }

  onClientChange(value: string): void {
    this.clientFilter.set(value ? Number(value) : null)
    this.reload()
  }

  openCreate(): void {
    this.router.navigate(['/invoices/new'])
  }

  onRowClick(row: InvoiceRow): void {
    this.router.navigate(['/invoices', row.id])
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
