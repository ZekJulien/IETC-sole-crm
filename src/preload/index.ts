import { contextBridge } from 'electron'
import { pingApi } from './apis/ping.api'
import { logApi } from './apis/log.api'

contextBridge.exposeInMainWorld('pingService', pingApi)
contextBridge.exposeInMainWorld('logService', logApi)
