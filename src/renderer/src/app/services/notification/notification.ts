import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async show(title: string, body: string): Promise<void> {
    try { await window.api.notification.show({ title, body }) }
    catch { return }
  }
}
