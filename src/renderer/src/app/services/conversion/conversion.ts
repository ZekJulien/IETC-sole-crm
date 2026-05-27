import { Injectable } from '@angular/core'
import {
  ConvertQuoteDto, ConvertQuoteResultDto,
  InvoiceBalanceDto, InvoiceBalanceResultDto,
  QuoteBillingDto,
} from '@shared/dtos/conversion'

@Injectable({ providedIn: 'root' })
export class ConversionService {
  async convertQuote(data: ConvertQuoteDto): Promise<ConvertQuoteResultDto> {
    const res = await window.api.conversion.convertQuote(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async invoiceBalance(data: InvoiceBalanceDto): Promise<InvoiceBalanceResultDto> {
    const res = await window.api.conversion.invoiceBalance(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async getQuoteBilling(quoteId: number): Promise<QuoteBillingDto> {
    const res = await window.api.conversion.getQuoteBilling(quoteId)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }
}
