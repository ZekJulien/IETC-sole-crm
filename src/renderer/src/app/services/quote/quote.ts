import { Injectable, signal } from '@angular/core'
import {
  QuoteDto, CreateQuoteDto, UpdateQuoteDto, UpdateQuoteStatusDto, QuoteStatusCount,
} from '@shared/dtos/quote'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly _quotes  = signal<QuoteDto[]>([])
  private readonly _loading = signal<boolean>(false)

  readonly quotes  = this._quotes.asReadonly()
  readonly loading = this._loading.asReadonly()

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      const res = await window.api.quote.get(args)
      if (res.error) throw new Error(res.error.message)
      this._quotes.set(res.data!.data)
    } finally {
      this._loading.set(false)
    }
  }

  async countByStatus(): Promise<QuoteStatusCount> {
    const res = await window.api.quote.countByStatus()
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async getById(id: number): Promise<QuoteDto | null> {
    const res = await window.api.quote.getById(id)
    if (res.error) throw new Error(res.error.message)
    return res.data
  }

  async add(data: CreateQuoteDto): Promise<QuoteDto> {
    const res = await window.api.quote.add(data)
    if (res.error) throw new Error(res.error.message)
    this._quotes.update(list => [res.data!, ...list])
    return res.data!
  }

  async update(data: UpdateQuoteDto): Promise<QuoteDto> {
    const res = await window.api.quote.update(data)
    if (res.error) throw new Error(res.error.message)
    this._quotes.update(list => list.map(q => q.id === data.id ? res.data! : q))
    return res.data!
  }

  async updateStatus(data: UpdateQuoteStatusDto): Promise<QuoteDto> {
    const res = await window.api.quote.updateStatus(data)
    if (res.error) throw new Error(res.error.message)
    this._quotes.update(list => list.map(q => q.id === data.id ? res.data! : q))
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.quote.remove(id)
    if (res.error) throw new Error(res.error.message)
    this._quotes.update(list => list.filter(q => q.id !== id))
  }
}
