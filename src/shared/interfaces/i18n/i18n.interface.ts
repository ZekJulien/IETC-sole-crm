import { IpcResponse } from '../../types'

export interface I18nAPI {
  setLocale: (locale: string) => Promise<IpcResponse<void>>
}
