import { Notification } from 'electron'
import { NotificationPayload } from '@shared/dtos/notification'

export class NotificationService {
  show(payload: NotificationPayload): void {
    if (!Notification.isSupported()) return
    new Notification({ title: payload.title, body: payload.body }).show()
  }
}
