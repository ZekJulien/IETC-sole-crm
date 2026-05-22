import { contextBridge } from 'electron'
import { logApi } from './apis/log.api'
import { clientApi } from './apis/client.api'
import { contactApi } from './apis/contact.api'
import { companyApi } from './apis/company.api'
import { categoryApi } from './apis/category.api'
import { expenseCategoryApi } from './apis/expense-category.api'
import { projectApi } from './apis/project.api'

contextBridge.exposeInMainWorld('logService', logApi)
contextBridge.exposeInMainWorld('api', {
  client:   clientApi,
  contact:  contactApi,
  company:  companyApi,
  category: categoryApi,
  expenseCategory: expenseCategoryApi,
  project:  projectApi,
})
