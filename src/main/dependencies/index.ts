import { ClientService, ContactService } from '../services/client'
import { CompanyService } from '../services/company'
import { CategoryService } from '../services/category'
import { ExpenseCategoryService } from '../services/expense-category'
import { ProjectService } from '../services/project'
import { TaskService } from '../services/task'
import { TimeEntryService } from '../services/time-entry'
import { ExpenseService } from '../services/expense'
import { QuoteService } from '../services/quote'
import { VatRateService } from '../services/vat-rate'
import { ProductService } from '../services/product'
import { getClientService, getContactService } from './client'
import { getCompanyService } from './company'
import { getCategoryService } from './category'
import { getExpenseCategoryService } from './expense-category'
import { getProjectService } from './project'
import { getTaskService } from './task'
import { getTimeEntryService } from './time-entry'
import { getExpenseService } from './expense'
import { getQuoteService } from './quote'
import { getVatRateService } from './vat-rate'
import { getProductService } from './product'

export interface AppDependencies {
  clientService:  ClientService
  contactService: ContactService
  companyService: CompanyService
  categoryService: CategoryService
  expenseCategoryService: ExpenseCategoryService
  projectService: ProjectService
  taskService: TaskService
  timeEntryService: TimeEntryService
  expenseService: ExpenseService
  quoteService: QuoteService
  vatRateService: VatRateService
  productService: ProductService
}

export function buildDependencies(): AppDependencies {
  return {
    clientService:  getClientService(),
    contactService: getContactService(),
    companyService: getCompanyService(),
    categoryService: getCategoryService(),
    expenseCategoryService: getExpenseCategoryService(),
    projectService: getProjectService(),
    taskService: getTaskService(),
    timeEntryService: getTimeEntryService(),
    expenseService: getExpenseService(),
    quoteService: getQuoteService(),
    vatRateService: getVatRateService(),
    productService: getProductService(),
  }
}
