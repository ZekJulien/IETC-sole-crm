import { contextBridge } from 'electron'
import { logApi } from './apis/log.api'
import { clientApi } from './apis/client.api'
import { contactApi } from './apis/contact.api'
import { companyApi } from './apis/company.api'
import { categoryApi } from './apis/category.api'
import { expenseCategoryApi } from './apis/expense-category.api'
import { projectApi } from './apis/project.api'
import { taskApi } from './apis/task.api'
import { timeEntryApi } from './apis/time-entry.api'
import { expenseApi } from './apis/expense.api'
import { quoteApi } from './apis/quote.api'
import { invoiceApi } from './apis/invoice.api'
import { vatRateApi } from './apis/vat-rate.api'
import { productApi } from './apis/product.api'
import { seedApi } from './apis/seed.api'
import { i18nApi } from './apis/i18n.api'

contextBridge.exposeInMainWorld('logService', logApi)
contextBridge.exposeInMainWorld('api', {
  client:   clientApi,
  contact:  contactApi,
  company:  companyApi,
  category: categoryApi,
  expenseCategory: expenseCategoryApi,
  project:  projectApi,
  task:     taskApi,
  timeEntry: timeEntryApi,
  expense:  expenseApi,
  quote:    quoteApi,
  invoice:  invoiceApi,
  vatRate:  vatRateApi,
  product:  productApi,
  seed:     seedApi,
  i18n:     i18nApi,
})
