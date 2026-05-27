import { IpcResponse } from '../../types'
import {
  ConvertQuoteDto, ConvertQuoteResultDto,
  InvoiceBalanceDto, InvoiceBalanceResultDto,
  QuoteBillingDto,
} from '../../dtos/conversion'

export interface ConversionAPI {
  convertQuote:    (data: ConvertQuoteDto)   => Promise<IpcResponse<ConvertQuoteResultDto>>
  invoiceBalance:  (data: InvoiceBalanceDto)  => Promise<IpcResponse<InvoiceBalanceResultDto>>
  getQuoteBilling: (quoteId: number)          => Promise<IpcResponse<QuoteBillingDto>>
}
