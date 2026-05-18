import { CLIENT_CHANNELS } from '@shared/channels/client'
import { ipcHandle } from '../../core/ipc.handle'
import { ClientService } from '../../services/client/client.service'

export function registerClientHandlers(service: ClientService): void {
  ipcHandle(CLIENT_CHANNELS.GET,       (args)  => service.get(args))
  ipcHandle(CLIENT_CHANNELS.GET_BY_ID, (id)    => service.getByIdWithRelation(id))
  ipcHandle(CLIENT_CHANNELS.ADD,       (data)  => service.add(data))
  ipcHandle(CLIENT_CHANNELS.UPDATE,    (data)  => service.update(data))
  ipcHandle(CLIENT_CHANNELS.REMOVE,    (id)    => service.remove(id))
}
