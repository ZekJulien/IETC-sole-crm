import { QUOTE_CHANNELS } from '@shared/channels/quote'
import {
  CreateQuoteSchema, UpdateQuoteSchema, UpdateQuoteStatusSchema,
} from '@shared/dtos/quote'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { QuoteService } from '../../services/quote/quote.service'

export function registerQuoteHandlers(service: QuoteService): void {
  ipcHandle(QUOTE_CHANNELS.GET,             FindManyArgsSchema,      (args) => service.get(args))
  ipcHandle(QUOTE_CHANNELS.GET_BY_ID,       IdSchema,                (id)   => service.getById(id))
  ipcHandle(QUOTE_CHANNELS.COUNT_BY_STATUS,                          ()     => service.countByStatus())
  ipcHandle(QUOTE_CHANNELS.ADD,             CreateQuoteSchema,       (data) => service.add(data))
  ipcHandle(QUOTE_CHANNELS.UPDATE,          UpdateQuoteSchema,       (data) => service.update(data))
  ipcHandle(QUOTE_CHANNELS.UPDATE_STATUS,   UpdateQuoteStatusSchema, (data) => service.updateStatus(data))
  ipcHandle(QUOTE_CHANNELS.REMOVE,          IdSchema,                (id)   => service.remove(id))
}
