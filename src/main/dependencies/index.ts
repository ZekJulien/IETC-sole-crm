import { ClientService, ContactService } from '../services/client'
import { CompanyService } from '../services/company'
import { CategoryService } from '../services/category'
import { getClientService, getContactService } from './client'
import { getCompanyService } from './company'
import { getCategoryService } from './category'

export interface AppDependencies {
  clientService:  ClientService
  contactService: ContactService
  companyService: CompanyService
  categoryService: CategoryService
}

export function buildDependencies(): AppDependencies {
  return {
    clientService:  getClientService(),
    contactService: getContactService(),
    companyService: getCompanyService(),
    categoryService: getCategoryService(),
  }
}
