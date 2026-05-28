import { Injectable } from '@angular/core'
import {
  ConvertQuoteDto, ConvertQuoteResultDto,
  InvoiceBalanceDto, InvoiceBalanceResultDto,
  QuoteBillingDto,
} from '@shared/dtos/conversion'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class ConversionService {
  async convertQuote(data: ConvertQuoteDto): Promise<ConvertQuoteResultDto> {
    return unwrap(await window.api.conversion.convertQuote(data))
  }

  async invoiceBalance(data: InvoiceBalanceDto): Promise<InvoiceBalanceResultDto> {
    return unwrap(await window.api.conversion.invoiceBalance(data))
  }

  async getQuoteBilling(quoteId: number): Promise<QuoteBillingDto> {
    return unwrap(await window.api.conversion.getQuoteBilling(quoteId))
  }
}
