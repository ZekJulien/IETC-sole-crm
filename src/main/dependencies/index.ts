import { ClientService, ContactService } from '../services/client'
import { CompanyService } from '../services/company'
import { CategoryService } from '../services/category'
import { ExpenseCategoryService } from '../services/expense-category'
import { getClientService, getContactService } from './client'
import { getCompanyService } from './company'
import { getCategoryService } from './category'
import { getExpenseCategoryService } from './expense-category'

export interface AppDependencies {
  clientService:  ClientService
  contactService: ContactService
  companyService: CompanyService
  categoryService: CategoryService
  expenseCategoryService: ExpenseCategoryService
}

export function buildDependencies(): AppDependencies {
  return {
    clientService:  getClientService(),
    contactService: getContactService(),
    companyService: getCompanyService(),
    categoryService: getCategoryService(),
    expenseCategoryService: getExpenseCategoryService(),
  }
}
