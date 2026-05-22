import { LogApi } from '@shared/interfaces'
import { ClientAPI, ContactAPI } from '@shared/interfaces/client'
import { CompanyAPI } from '@shared/interfaces/company'
import { CategoryAPI } from '@shared/interfaces/category'
import { ExpenseCategoryAPI } from '@shared/interfaces/expense-category'
import { ProjectAPI } from '@shared/interfaces/project'

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
    }
  }
}
