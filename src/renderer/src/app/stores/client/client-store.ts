import { Injectable, computed, inject, signal } from '@angular/core'
import { ClientDto, CreateClientDto, UpdateClientDto } from '@shared/dtos/client'
import { FindManyArgs } from '@shared/types'
import { ClientService } from '@app/services/client/client'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class ClientStore {
  private readonly clientSvc = inject(ClientService)
  private readonly toast     = inject(ToastService)
  private readonly errors    = inject(ErrorService)
  private readonly i18n      = inject(I18nService)

  private readonly _clients  = signal<ClientDto[]>([])
  private readonly _selected = signal<ClientDto | null>(null)
  private readonly _loading  = signal<boolean>(false)
  private readonly _saving   = signal<boolean>(false)
  private readonly _total    = signal<number>(0)

  readonly clients     = this._clients.asReadonly()
  readonly selected    = this._selected.asReadonly()
  readonly loading     = this._loading.asReadonly()
  readonly saving      = this._saving.asReadonly()
  readonly total       = this._total.asReadonly()
  readonly hasSelected = computed(() => !!this._selected())

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      await this.clientSvc.load({ ...args, count: true })
      this._clients.set(this.clientSvc.clients())
      this._total.set(this.clientSvc.total())
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  select(client: ClientDto | null): void {
    this._selected.set(client)
  }

  async add(data: CreateClientDto): Promise<ClientDto | null> {
    this._saving.set(true)
    try {
      const created = await this.clientSvc.add(data)
      this._clients.update(list => [...list, created])
      this.toast.success(this.i18n.t('client.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateClientDto): Promise<ClientDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.clientSvc.update(data)
      this._clients.update(list => list.map(c => c.id === data.id ? updated : c))
      if (this._selected()?.id === data.id) this._selected.set(updated)
      this.toast.success(this.i18n.t('client.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.clientSvc.remove(id)
      this._clients.update(list => list.filter(c => c.id !== id))
      if (this._selected()?.id === id) this._selected.set(null)
      this.toast.success(this.i18n.t('client.toast.deleted'))
    } catch (e) { this.errors.handle(e) }
  }
}
