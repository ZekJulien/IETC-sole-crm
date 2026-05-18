import { LogApi } from '@shared/interfaces'
import { ClientAPI, ContactAPI } from '@shared/interfaces/client'

declare global {
  interface Window {
    logService: LogApi
    api: {
      client:  ClientAPI
      contact: ContactAPI
    }
  }
}
