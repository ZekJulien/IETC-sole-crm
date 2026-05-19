import { Injectable, inject, signal } from '@angular/core'
import { ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { ContactService } from '@app/services/client/contact'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class ContactStore {
  private readonly contactSvc = inject(ContactService)
  private readonly toast      = inject(ToastService)
  private readonly errors     = inject(ErrorService)
  private readonly i18n       = inject(I18nService)

  private readonly _contacts = signal<ContactDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly contacts = this._contacts.asReadonly()
  readonly loading  = this._loading.asReadonly()

  async loadByClientId(clientId: number): Promise<void> {
    this._loading.set(true)
    try {
      await this.contactSvc.loadByClientId(clientId)
      this._contacts.set(this.contactSvc.contacts())
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async add(data: CreateContactDto): Promise<void> {
    try {
      const created = await this.contactSvc.add(data)
      this._contacts.update(list => [...list, created])
      this.toast.success(this.i18n.t('contact.toast.added'))
    } catch (e) { this.errors.handle(e) }
  }

  async update(data: UpdateContactDto): Promise<void> {
    try {
      const updated = await this.contactSvc.update(data)
      this._contacts.update(list => list.map(c => c.id === data.id ? updated : c))
      this.toast.success(this.i18n.t('contact.toast.updated'))
    } catch (e) { this.errors.handle(e) }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.contactSvc.remove(id)
      this._contacts.update(list => list.filter(c => c.id !== id))
      this.toast.success(this.i18n.t('contact.toast.removed'))
    } catch (e) { this.errors.handle(e) }
  }
}
