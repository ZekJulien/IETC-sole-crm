import { ClientService, ContactService } from '../services/client'
import { CompanyService } from '../services/company'
import { getClientService, getContactService } from './client'
import { getCompanyService } from './company'

export interface AppDependencies {
  clientService:  ClientService
  contactService: ContactService
  companyService: CompanyService
}

export function buildDependencies(): AppDependencies {
  return {
    clientService:  getClientService(),
    contactService: getContactService(),
    companyService: getCompanyService(),
  }
}
