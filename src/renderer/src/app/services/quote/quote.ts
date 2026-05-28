import { Injectable, signal } from '@angular/core'
import {
  QuoteDto, CreateQuoteDto, UpdateQuoteDto, UpdateQuoteStatusDto, QuoteStatusCount,
} from '@shared/dtos/quote'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly _quotes  = signal<QuoteDto[]>([])
  private readonly _loading = signal<boolean>(false)

  readonly quotes  = this._quotes.asReadonly()
  readonly loading = this._loading.asReadonly()

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      const result = unwrap(await window.api.quote.get(args))
      this._quotes.set(result.data)
    } finally {
      this._loading.set(false)
    }
  }

  async countByStatus(): Promise<QuoteStatusCount> {
    return unwrap(await window.api.quote.countByStatus())
  }

  async getById(id: number): Promise<QuoteDto | null> {
    return unwrap(await window.api.quote.getById(id))
  }

  async add(data: CreateQuoteDto): Promise<QuoteDto> {
    const created = unwrap(await window.api.quote.add(data))
    this._quotes.update(list => [created, ...list])
    return created
  }

  async update(data: UpdateQuoteDto): Promise<QuoteDto> {
    const updated = unwrap(await window.api.quote.update(data))
    this._quotes.update(list => list.map(q => q.id === data.id ? updated : q))
    return updated
  }

  async updateStatus(data: UpdateQuoteStatusDto): Promise<QuoteDto> {
    const updated = unwrap(await window.api.quote.updateStatus(data))
    this._quotes.update(list => list.map(q => q.id === data.id ? updated : q))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.quote.remove(id))
    this._quotes.update(list => list.filter(q => q.id !== id))
  }
}
