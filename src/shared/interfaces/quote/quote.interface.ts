import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import {
  QuoteDto, CreateQuoteDto, UpdateQuoteDto, UpdateQuoteStatusDto, QuoteStatusCount,
} from '../../dtos/quote'

export interface QuoteAPI {
  get:           (args?: FindManyArgs)         => Promise<IpcResponse<PaginatedResult<QuoteDto>>>
  getById:       (id: number)                  => Promise<IpcResponse<QuoteDto | null>>
  countByStatus: ()                            => Promise<IpcResponse<QuoteStatusCount>>
  add:           (data: CreateQuoteDto)        => Promise<IpcResponse<QuoteDto>>
  update:        (data: UpdateQuoteDto)        => Promise<IpcResponse<QuoteDto>>
  updateStatus:  (data: UpdateQuoteStatusDto)  => Promise<IpcResponse<QuoteDto>>
  remove:        (id: number)                  => Promise<IpcResponse<void>>
}
