import { CONTACT_CHANNELS } from '@shared/channels/client'
import { ipcHandle } from '../../core/ipc.handle'
import { ContactService } from '../../services/contact/contact.service'

export function registerContactHandlers(service: ContactService): void {
  ipcHandle(CONTACT_CHANNELS.GET,              (args)     => service.get(args))
  ipcHandle(CONTACT_CHANNELS.GET_BY_CLIENT_ID, (clientId) => service.getByClientId(clientId))
  ipcHandle(CONTACT_CHANNELS.ADD,              (data)     => service.add(data))
  ipcHandle(CONTACT_CHANNELS.UPDATE,           (data)     => service.update(data))
  ipcHandle(CONTACT_CHANNELS.REMOVE,           (id)       => service.remove(id))
}
