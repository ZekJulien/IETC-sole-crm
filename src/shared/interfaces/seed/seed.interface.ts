import { IpcResponse } from '../../types'

export interface SeedAPI {
  requiredDefaults: () => Promise<IpcResponse<void>>
  demo:             () => Promise<IpcResponse<void>>
  reset:            () => Promise<IpcResponse<void>>
}
