import { IpcResponse } from '../../types'
import { CompanyDto, SaveCompanyInput } from '../../dtos/company'

export interface CompanyAPI {
  get:                 ()                        => Promise<IpcResponse<CompanyDto | null>>
  save:                (input: SaveCompanyInput) => Promise<IpcResponse<CompanyDto>>
  resetInvoiceCounter: (value: number)           => Promise<IpcResponse<void>>
  resetQuoteCounter:   (value: number)           => Promise<IpcResponse<void>>
  setDashboardNote:    (note: string)            => Promise<IpcResponse<void>>
}
