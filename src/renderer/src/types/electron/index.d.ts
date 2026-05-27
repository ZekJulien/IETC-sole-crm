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
import { SeedAPI } from '@shared/interfaces/seed'
import { ConversionAPI } from '@shared/interfaces/conversion'
import { PdfAPI } from '@shared/interfaces/pdf'
import { I18nAPI } from '@shared/interfaces/i18n'

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
      seed:     SeedAPI
      conversion: ConversionAPI
      pdf:      PdfAPI
      i18n:     I18nAPI
    }
  }
}
