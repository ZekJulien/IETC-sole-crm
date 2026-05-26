import { AppDependencies } from '../dependencies'
import { registerLogHandlers } from './log.handler'
import { registerClientHandlers, registerContactHandlers } from './client'
import { registerCompanyHandlers } from './company'
import { registerCategoryHandlers } from './category'
import { registerExpenseCategoryHandlers } from './expense-category'
import { registerProjectHandlers } from './project'
import { registerTaskHandlers } from './task'
import { registerTimeEntryHandlers } from './time-entry'
import { registerExpenseHandlers } from './expense'
import { registerQuoteHandlers } from './quote'
import { registerInvoiceHandlers } from './invoice'
import { registerVatRateHandlers } from './vat-rate'
import { registerProductHandlers } from './product'

export function registerAllHandlers(deps: AppDependencies): void {
  registerLogHandlers()
  registerClientHandlers(deps.clientService)
  registerContactHandlers(deps.contactService)
  registerCompanyHandlers(deps.companyService)
  registerCategoryHandlers(deps.categoryService)
  registerExpenseCategoryHandlers(deps.expenseCategoryService)
  registerProjectHandlers(deps.projectService)
  registerTaskHandlers(deps.taskService)
  registerTimeEntryHandlers(deps.timeEntryService)
  registerExpenseHandlers(deps.expenseService)
  registerQuoteHandlers(deps.quoteService)
  registerInvoiceHandlers(deps.invoiceService)
  registerVatRateHandlers(deps.vatRateService)
  registerProductHandlers(deps.productService)
}
