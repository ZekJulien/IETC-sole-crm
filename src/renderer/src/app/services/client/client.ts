import { Injectable, signal, computed } from '@angular/core'
import { ClientDto, CreateClientDto, UpdateClientDto } from '@shared/dtos/client'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly _clients = signal<ClientDto[]>([])
  private readonly _total   = signal<number>(0)
  private readonly _loading = signal<boolean>(false)

  readonly clients  = this._clients.asReadonly()
  readonly total    = this._total.asReadonly()
  readonly loading  = this._loading.asReadonly()
  readonly hasItems = computed(() => this._clients().length > 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const res = await window.api.client.get(args)
    if (res.error) throw new Error(res.error.message)
    this._clients.set(res.data!.data)
    this._total.set(res.data!.total ?? 0)
    this._loading.set(false)
  }

  async getById(id: number): Promise<ClientDto | null> {
    const res = await window.api.client.getById(id)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async add(data: CreateClientDto): Promise<ClientDto> {
    const res = await window.api.client.add(data)
    if (res.error) throw new Error(res.error.message)
    this._clients.update(list => [...list, res.data!])
    return res.data!
  }

  async update(data: UpdateClientDto): Promise<ClientDto> {
    const res = await window.api.client.update(data)
    if (res.error) throw new Error(res.error.message)
    this._clients.update(list => list.map(c => c.id === data.id ? res.data! : c))
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.client.remove(id)
    if (res.error) throw new Error(res.error.message)
    this._clients.update(list => list.filter(c => c.id !== id))
  }
}
