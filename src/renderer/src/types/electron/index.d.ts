import { LogApi } from '@shared/interfaces'

declare global {
  interface Window {
    logService:  LogApi
  }
}
