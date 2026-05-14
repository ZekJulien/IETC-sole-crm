import { contextBridge } from 'electron'
import { logApi } from './apis/log.api'

contextBridge.exposeInMainWorld('logService', logApi)
