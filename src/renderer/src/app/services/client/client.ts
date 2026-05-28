import { Injectable, signal, computed } from '@angular/core'
import { ClientDto, CreateClientDto, UpdateClientDto } from '@shared/dtos/client'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

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
    const result = unwrap(await window.api.client.get(args))
    this._clients.set(result.data)
    this._total.set(result.total ?? 0)
    this._loading.set(false)
  }

  async getById(id: number): Promise<ClientDto | null> {
    return unwrap(await window.api.client.getById(id))
  }

  async add(data: CreateClientDto): Promise<ClientDto> {
    const created = unwrap(await window.api.client.add(data))
    this._clients.update(list => [...list, created])
    return created
  }

  async update(data: UpdateClientDto): Promise<ClientDto> {
    const updated = unwrap(await window.api.client.update(data))
    this._clients.update(list => list.map(c => c.id === data.id ? updated : c))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.client.remove(id))
    this._clients.update(list => list.filter(c => c.id !== id))
  }
}
