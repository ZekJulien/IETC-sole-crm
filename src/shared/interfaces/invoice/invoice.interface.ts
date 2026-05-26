import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import {
  InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto,
  RecordPaymentDto, InvoiceStatusCount, InvoiceStats,
} from '../../dtos/invoice'

export interface InvoiceAPI {
  get:           (args?: FindManyArgs)        => Promise<IpcResponse<PaginatedResult<InvoiceDto>>>
  getById:       (id: number)                 => Promise<IpcResponse<InvoiceDto | null>>
  countByStatus: ()                           => Promise<IpcResponse<InvoiceStatusCount>>
  getStats:      ()                           => Promise<IpcResponse<InvoiceStats>>
  add:           (data: CreateInvoiceDto)     => Promise<IpcResponse<InvoiceDto>>
  update:        (data: UpdateInvoiceDto)     => Promise<IpcResponse<InvoiceDto>>
  updateStatus:  (data: UpdateInvoiceStatusDto) => Promise<IpcResponse<InvoiceDto>>
  remove:        (id: number)                 => Promise<IpcResponse<void>>
  addPayment:    (data: RecordPaymentDto)     => Promise<IpcResponse<InvoiceDto>>
  removePayment: (id: number)                 => Promise<IpcResponse<InvoiceDto>>
}
