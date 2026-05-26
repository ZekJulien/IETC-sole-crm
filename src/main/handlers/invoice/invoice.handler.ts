import { INVOICE_CHANNELS } from '@shared/channels/invoice'
import {
  CreateInvoiceSchema, UpdateInvoiceSchema, UpdateInvoiceStatusSchema, RecordPaymentSchema,
} from '@shared/dtos/invoice'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { InvoiceService } from '../../services/invoice/invoice.service'

export function registerInvoiceHandlers(service: InvoiceService): void {
  ipcHandle(INVOICE_CHANNELS.GET,             FindManyArgsSchema,        (args) => service.get(args))
  ipcHandle(INVOICE_CHANNELS.GET_BY_ID,       IdSchema,                  (id)   => service.getById(id))
  ipcHandle(INVOICE_CHANNELS.COUNT_BY_STATUS,                            ()     => service.countByStatus())
  ipcHandle(INVOICE_CHANNELS.GET_STATS,                                  ()     => service.getStats())
  ipcHandle(INVOICE_CHANNELS.ADD,             CreateInvoiceSchema,       (data) => service.add(data))
  ipcHandle(INVOICE_CHANNELS.UPDATE,          UpdateInvoiceSchema,       (data) => service.update(data))
  ipcHandle(INVOICE_CHANNELS.UPDATE_STATUS,   UpdateInvoiceStatusSchema, (data) => service.updateStatus(data))
  ipcHandle(INVOICE_CHANNELS.REMOVE,          IdSchema,                  (id)   => service.remove(id))
  ipcHandle(INVOICE_CHANNELS.ADD_PAYMENT,     RecordPaymentSchema,       (data) => service.addPayment(data))
  ipcHandle(INVOICE_CHANNELS.REMOVE_PAYMENT,  IdSchema,                  (id)   => service.removePayment(id))
}
