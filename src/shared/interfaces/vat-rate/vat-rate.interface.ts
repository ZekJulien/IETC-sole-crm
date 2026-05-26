import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { VatRateDto, CreateVatRateDto, UpdateVatRateDto } from '../../dtos/vat-rate'

export interface VatRateAPI {
  get:    (args?: FindManyArgs)     => Promise<IpcResponse<PaginatedResult<VatRateDto>>>
  add:    (data: CreateVatRateDto)  => Promise<IpcResponse<VatRateDto>>
  update: (data: UpdateVatRateDto)  => Promise<IpcResponse<VatRateDto>>
  remove: (id: number)              => Promise<IpcResponse<void>>
}
