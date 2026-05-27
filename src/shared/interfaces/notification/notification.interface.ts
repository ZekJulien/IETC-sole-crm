import { IpcResponse } from '../../types'
import { NotificationPayload } from '../../dtos/notification'

export interface NotificationAPI {
  show: (payload: NotificationPayload) => Promise<IpcResponse<void>>
}
