import { CONVERSION_CHANNELS } from '@shared/channels/conversion'
import { ConvertQuoteSchema, InvoiceBalanceSchema } from '@shared/dtos/conversion'
import { IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { ConversionService } from '../../services/conversion'

export function registerConversionHandlers(service: ConversionService): void {
  ipcHandle(CONVERSION_CHANNELS.CONVERT_QUOTE,   ConvertQuoteSchema,   (data) => service.convertQuote(data))
  ipcHandle(CONVERSION_CHANNELS.INVOICE_BALANCE, InvoiceBalanceSchema, (data) => service.invoiceBalance(data))
  ipcHandle(CONVERSION_CHANNELS.QUOTE_BILLING,   IdSchema,             (id)   => service.getQuoteBilling(id))
}
