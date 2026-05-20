import { CONTACT_CHANNELS } from '@shared/channels/client'
import { CreateContactSchema, UpdateContactSchema } from '@shared/dtos/client'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { ContactService } from '../../services/client/contact.service'

export function registerContactHandlers(service: ContactService): void {
  ipcHandle(CONTACT_CHANNELS.GET,              FindManyArgsSchema,  (args)     => service.get(args))
  ipcHandle(CONTACT_CHANNELS.GET_BY_CLIENT_ID, IdSchema,            (clientId) => service.getByClientId(clientId))
  ipcHandle(CONTACT_CHANNELS.ADD,              CreateContactSchema, (data)     => service.add(data))
  ipcHandle(CONTACT_CHANNELS.UPDATE,           UpdateContactSchema, (data)     => service.update(data))
  ipcHandle(CONTACT_CHANNELS.REMOVE,           IdSchema,            (id)       => service.remove(id))
}
