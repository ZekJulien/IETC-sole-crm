import { ClientService, ContactService } from '../services/client'
import { getClientService, getContactService } from './client'

export interface AppDependencies {
  clientService:  ClientService
  contactService: ContactService
}

export function buildDependencies(): AppDependencies {
  return {
    clientService:  getClientService(),
    contactService: getContactService(),
  }
}
