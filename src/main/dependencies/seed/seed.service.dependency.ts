import { SeedService } from '../../services/seed'
import { getClientService, getContactService } from '../client'
import { getCompanyService } from '../company'
import { getCategoryService } from '../category'
import { getExpenseCategoryService } from '../expense-category'
import { getProjectService } from '../project'
import { getTaskService } from '../task'
import { getTimeEntryService } from '../time-entry'
import { getExpenseService } from '../expense'
import { getProductService } from '../product'
import { getQuoteService } from '../quote'
import { getInvoiceService } from '../invoice'

let _instance: SeedService | null = null

export function getSeedService(): SeedService {
  if (!_instance) {
    _instance = new SeedService({
      client:          getClientService(),
      contact:         getContactService(),
      company:         getCompanyService(),
      category:        getCategoryService(),
      expenseCategory: getExpenseCategoryService(),
      project:         getProjectService(),
      task:            getTaskService(),
      timeEntry:       getTimeEntryService(),
      expense:         getExpenseService(),
      product:         getProductService(),
      quote:           getQuoteService(),
      invoice:         getInvoiceService(),
    })
  }
  return _instance
}
