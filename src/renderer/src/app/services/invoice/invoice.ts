import { Injectable, signal } from '@angular/core'
import {
  InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto,
  RecordPaymentDto, InvoiceStatusCount, InvoiceStats,
} from '@shared/dtos/invoice'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly _invoices = signal<InvoiceDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly invoices = this._invoices.asReadonly()
  readonly loading  = this._loading.asReadonly()

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      const result = unwrap(await window.api.invoice.get(args))
      this._invoices.set(result.data)
    } finally {
      this._loading.set(false)
    }
  }

  async countByStatus(): Promise<InvoiceStatusCount> {
    return unwrap(await window.api.invoice.countByStatus())
  }

  async getStats(): Promise<InvoiceStats> {
    return unwrap(await window.api.invoice.getStats())
  }

  async sumPaymentsByMonth(year: number): Promise<number[]> {
    return unwrap(await window.api.invoice.sumPaymentsByMonth({ year }))
  }

  async getById(id: number): Promise<InvoiceDto | null> {
    return unwrap(await window.api.invoice.getById(id))
  }

  async add(data: CreateInvoiceDto): Promise<InvoiceDto> {
    const created = unwrap(await window.api.invoice.add(data))
    this._invoices.update(list => [created, ...list])
    return created
  }

  async update(data: UpdateInvoiceDto): Promise<InvoiceDto> {
    const updated = unwrap(await window.api.invoice.update(data))
    this._invoices.update(list => list.map(i => i.id === data.id ? updated : i))
    return updated
  }

  async updateStatus(data: UpdateInvoiceStatusDto): Promise<InvoiceDto> {
    const updated = unwrap(await window.api.invoice.updateStatus(data))
    this._invoices.update(list => list.map(i => i.id === data.id ? updated : i))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.invoice.remove(id))
    this._invoices.update(list => list.filter(i => i.id !== id))
  }

  async addPayment(data: RecordPaymentDto): Promise<InvoiceDto> {
    const updated = unwrap(await window.api.invoice.addPayment(data))
    this._invoices.update(list => list.map(i => i.id === data.invoiceId ? updated : i))
    return updated
  }

  async removePayment(id: number): Promise<InvoiceDto> {
    const updated = unwrap(await window.api.invoice.removePayment(id))
    this._invoices.update(list => list.map(i => i.id === updated.id ? updated : i))
    return updated
  }
}
