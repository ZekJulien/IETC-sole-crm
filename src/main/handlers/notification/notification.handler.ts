import { NOTIFICATION_CHANNELS } from '@shared/channels/notification'
import { NotificationPayloadSchema } from '@shared/dtos/notification'
import { ipcHandleNoTx } from '../../core/ipc.handle'
import { NotificationService } from '../../services/notification'

export function registerNotificationHandlers(): void {
  const service = new NotificationService()
  ipcHandleNoTx(NOTIFICATION_CHANNELS.SHOW, NotificationPayloadSchema, (payload) => service.show(payload))
}
