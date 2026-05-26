import { Injectable, signal } from '@angular/core'
import {
  InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto,
  RecordPaymentDto, InvoiceStatusCount, InvoiceStats,
} from '@shared/dtos/invoice'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly _invoices = signal<InvoiceDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly invoices = this._invoices.asReadonly()
  readonly loading  = this._loading.asReadonly()

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      const res = await window.api.invoice.get(args)
      if (res.error) throw new Error(res.error.message)
      this._invoices.set(res.data!.data)
    } finally {
      this._loading.set(false)
    }
  }

  async countByStatus(): Promise<InvoiceStatusCount> {
    const res = await window.api.invoice.countByStatus()
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async getStats(): Promise<InvoiceStats> {
    const res = await window.api.invoice.getStats()
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async getById(id: number): Promise<InvoiceDto | null> {
    const res = await window.api.invoice.getById(id)
    if (res.error) throw new Error(res.error.message)
    return res.data
  }

  async add(data: CreateInvoiceDto): Promise<InvoiceDto> {
    const res = await window.api.invoice.add(data)
    if (res.error) throw new Error(res.error.message)
    this._invoices.update(list => [res.data!, ...list])
    return res.data!
  }

  async update(data: UpdateInvoiceDto): Promise<InvoiceDto> {
    const res = await window.api.invoice.update(data)
    if (res.error) throw new Error(res.error.message)
    this._invoices.update(list => list.map(i => i.id === data.id ? res.data! : i))
    return res.data!
  }

  async updateStatus(data: UpdateInvoiceStatusDto): Promise<InvoiceDto> {
    const res = await window.api.invoice.updateStatus(data)
    if (res.error) throw new Error(res.error.message)
    this._invoices.update(list => list.map(i => i.id === data.id ? res.data! : i))
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.invoice.remove(id)
    if (res.error) throw new Error(res.error.message)
    this._invoices.update(list => list.filter(i => i.id !== id))
  }

  async addPayment(data: RecordPaymentDto): Promise<InvoiceDto> {
    const res = await window.api.invoice.addPayment(data)
    if (res.error) throw new Error(res.error.message)
    this._invoices.update(list => list.map(i => i.id === data.invoiceId ? res.data! : i))
    return res.data!
  }

  async removePayment(id: number): Promise<InvoiceDto> {
    const res = await window.api.invoice.removePayment(id)
    if (res.error) throw new Error(res.error.message)
    this._invoices.update(list => list.map(i => i.id === res.data!.id ? res.data! : i))
    return res.data!
  }
}
