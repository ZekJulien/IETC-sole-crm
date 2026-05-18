import { Injectable, signal } from '@angular/core'
import { ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly _contacts = signal<ContactDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly contacts = this._contacts.asReadonly()
  readonly loading  = this._loading.asReadonly()

  async loadByClientId(clientId: number): Promise<void> {
    this._loading.set(true)
    const res = await window.api.contact.getByClientId(clientId)
    if (res.error) throw new Error(res.error.message)
    this._contacts.set(res.data!)
    this._loading.set(false)
  }

  async search(args?: FindManyArgs): Promise<ContactDto[]> {
    const res = await window.api.contact.get(args)
    if (res.error) throw new Error(res.error.message)
    return res.data!.data
  }

  async add(data: CreateContactDto): Promise<ContactDto> {
    const res = await window.api.contact.add(data)
    if (res.error) throw new Error(res.error.message)
    this._contacts.update(list => [...list, res.data!])
    return res.data!
  }

  async update(data: UpdateContactDto): Promise<ContactDto> {
    const res = await window.api.contact.update(data)
    if (res.error) throw new Error(res.error.message)
    this._contacts.update(list => list.map(c => c.id === data.id ? res.data! : c))
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.contact.remove(id)
    if (res.error) throw new Error(res.error.message)
    this._contacts.update(list => list.filter(c => c.id !== id))
  }
}
