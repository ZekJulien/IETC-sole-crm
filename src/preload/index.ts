import { contextBridge } from 'electron'
import { logApi } from './apis/log.api'
import { clientApi } from './apis/client.api'
import { contactApi } from './apis/contact.api'

contextBridge.exposeInMainWorld('logService', logApi)
contextBridge.exposeInMainWorld('api', {
  client:  clientApi,
  contact: contactApi,
})
