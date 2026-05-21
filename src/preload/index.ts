import { contextBridge } from 'electron'
import { logApi } from './apis/log.api'
import { clientApi } from './apis/client.api'
import { contactApi } from './apis/contact.api'
import { companyApi } from './apis/company.api'
import { categoryApi } from './apis/category.api'

contextBridge.exposeInMainWorld('logService', logApi)
contextBridge.exposeInMainWorld('api', {
  client:   clientApi,
  contact:  contactApi,
  company:  companyApi,
  category: categoryApi,
})
