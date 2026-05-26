import { VAT_RATE_CHANNELS } from '@shared/channels/vat-rate'
import { CreateVatRateSchema, UpdateVatRateSchema } from '@shared/dtos/vat-rate'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { VatRateService } from '../../services/vat-rate/vat-rate.service'

export function registerVatRateHandlers(service: VatRateService): void {
  ipcHandle(VAT_RATE_CHANNELS.GET,    FindManyArgsSchema,  (args) => service.get(args))
  ipcHandle(VAT_RATE_CHANNELS.ADD,    CreateVatRateSchema, (data) => service.add(data))
  ipcHandle(VAT_RATE_CHANNELS.UPDATE, UpdateVatRateSchema, (data) => service.update(data))
  ipcHandle(VAT_RATE_CHANNELS.REMOVE, IdSchema,            (id)   => service.remove(id))
}
