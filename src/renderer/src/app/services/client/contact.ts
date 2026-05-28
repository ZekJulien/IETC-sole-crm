import { Injectable, signal } from '@angular/core'
import { ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly _contacts = signal<ContactDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly contacts = this._contacts.asReadonly()
  readonly loading  = this._loading.asReadonly()

  async loadByClientId(clientId: number): Promise<void> {
    this._loading.set(true)
    const contacts = unwrap(await window.api.contact.getByClientId(clientId))
    this._contacts.set(contacts)
    this._loading.set(false)
  }

  async search(args?: FindManyArgs): Promise<ContactDto[]> {
    const result = unwrap(await window.api.contact.get(args))
    return result.data
  }

  async add(data: CreateContactDto): Promise<ContactDto> {
    const created = unwrap(await window.api.contact.add(data))
    this._contacts.update(list => [...list, created])
    return created
  }

  async update(data: UpdateContactDto): Promise<ContactDto> {
    const updated = unwrap(await window.api.contact.update(data))
    this._contacts.update(list => list.map(c => c.id === data.id ? updated : c))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.contact.remove(id))
    this._contacts.update(list => list.filter(c => c.id !== id))
  }
}
