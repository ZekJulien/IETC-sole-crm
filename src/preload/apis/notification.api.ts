import { ipcRenderer } from 'electron'
import { NOTIFICATION_CHANNELS } from '@shared/channels/notification'
import { NotificationAPI } from '@shared/interfaces/notification'

export const notificationApi: NotificationAPI = {
  show: (payload) => ipcRenderer.invoke(NOTIFICATION_CHANNELS.SHOW, payload),
}
