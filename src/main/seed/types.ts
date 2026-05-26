import { ClientService, ContactService } from '../services/client'
import { CompanyService } from '../services/company'
import { CategoryService } from '../services/category'
import { ExpenseCategoryService } from '../services/expense-category'
import { ProjectService } from '../services/project'
import { TaskService } from '../services/task'
import { TimeEntryService } from '../services/time-entry'
import { ExpenseService } from '../services/expense'
import { ProductService } from '../services/product'
import { QuoteService } from '../services/quote'
import { InvoiceService } from '../services/invoice'

export interface SeedServices {
  client:          ClientService
  contact:         ContactService
  company:         CompanyService
  category:        CategoryService
  expenseCategory: ExpenseCategoryService
  project:         ProjectService
  task:            TaskService
  timeEntry:       TimeEntryService
  expense:         ExpenseService
  product:         ProductService
  quote:           QuoteService
  invoice:         InvoiceService
}
