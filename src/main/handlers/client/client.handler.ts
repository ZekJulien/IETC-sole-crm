import { CLIENT_CHANNELS } from '@shared/channels/client'
import { CreateClientSchema, UpdateClientSchema } from '@shared/dtos/client'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { ClientService } from '../../services/client/client.service'

export function registerClientHandlers(service: ClientService): void {
  ipcHandle(CLIENT_CHANNELS.GET,       FindManyArgsSchema, (args) => service.get(args))
  ipcHandle(CLIENT_CHANNELS.GET_BY_ID, IdSchema,           (id)   => service.getByIdWithRelation(id))
  ipcHandle(CLIENT_CHANNELS.ADD,       CreateClientSchema, (data) => service.add(data))
  ipcHandle(CLIENT_CHANNELS.UPDATE,    UpdateClientSchema, (data) => service.update(data))
  ipcHandle(CLIENT_CHANNELS.REMOVE,    IdSchema,           (id)   => service.remove(id))
}
