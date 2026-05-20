import { LogApi } from '@shared/interfaces'
import { ClientAPI, ContactAPI } from '@shared/interfaces/client'
import { CompanyAPI } from '@shared/interfaces/company'

declare global {
  interface Window {
    logService: LogApi
    api: {
      client:  ClientAPI
      contact: ContactAPI
      company: CompanyAPI
    }
  }
}
