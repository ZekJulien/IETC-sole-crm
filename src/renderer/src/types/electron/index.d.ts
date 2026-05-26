import { LogApi } from '@shared/interfaces'
import { ClientAPI, ContactAPI } from '@shared/interfaces/client'
import { CompanyAPI } from '@shared/interfaces/company'
import { CategoryAPI } from '@shared/interfaces/category'
import { ExpenseCategoryAPI } from '@shared/interfaces/expense-category'
import { ProjectAPI } from '@shared/interfaces/project'
import { TaskAPI } from '@shared/interfaces/task'
import { TimeEntryAPI } from '@shared/interfaces/time-entry'
import { ExpenseAPI } from '@shared/interfaces/expense'
import { QuoteAPI } from '@shared/interfaces/quote'
import { InvoiceAPI } from '@shared/interfaces/invoice'
import { VatRateAPI } from '@shared/interfaces/vat-rate'
import { ProductAPI } from '@shared/interfaces/product'

declare global {
  interface Window {
    logService: LogApi
    api: {
      client:   ClientAPI
      contact:  ContactAPI
      company:  CompanyAPI
      category: CategoryAPI
      expenseCategory: ExpenseCategoryAPI
      project:  ProjectAPI
      task:     TaskAPI
      timeEntry: TimeEntryAPI
      expense:  ExpenseAPI
      quote:    QuoteAPI
      invoice:  InvoiceAPI
      vatRate:  VatRateAPI
      product:  ProductAPI
    }
  }
}
