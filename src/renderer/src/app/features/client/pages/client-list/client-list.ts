import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core'
import { LucideUsers } from '@lucide/angular'
import { ClientDto, CreateClientDto, UpdateClientDto, ClientType, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { ClientStore } from '@app/stores/client/client-store'
import { ContactStore } from '@app/stores/client/contact-store'
import { ConfirmDialog, ViewMode } from '@app/components'
import { ResizableSplitter } from '@app/directives'
import { TranslatePipe } from '@app/pipes'
import { ClientCreatePanel, ClientDetailPanel, ClientListPanel } from '../../components'

const MAIN_WIDTH_KEY     = 'client-list:main-width'
const MAIN_WIDTH_MIN     = 200
const MAIN_WIDTH_MAX     = 500
const MAIN_WIDTH_DEFAULT = 280

@Component({
  selector: 'app-client-list',
  imports: [
    LucideUsers,
    ConfirmDialog,
    ResizableSplitter,
    ClientListPanel,
    ClientCreatePanel,
    ClientDetailPanel,
    TranslatePipe,
  ],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit {
  readonly clientStore  = inject(ClientStore)
  readonly contactStore = inject(ContactStore)

  readonly viewMode        = signal<ViewMode>('inbox')
  readonly searchTerm      = signal<string>('')
  readonly mainWidth       = signal<number>(this.readStoredWidth())
  readonly dragging        = signal<boolean>(false)
  readonly isCreating      = signal<boolean>(false)
  readonly pendingRemoveId = signal<number | null>(null)
  readonly newClientType   = signal<ClientType>(ClientType.COMPANY)

  readonly selectedClient = computed(() => this.clientStore.selected())

  readonly MAIN_WIDTH_MIN = MAIN_WIDTH_MIN
  readonly MAIN_WIDTH_MAX = MAIN_WIDTH_MAX

  @ViewChild(ClientCreatePanel) createPanel?: ClientCreatePanel

  async ngOnInit(): Promise<void> {
    await this.clientStore.load()
  }

  async load(search: string): Promise<void> {
    await this.clientStore.load({ search })
  }

  async onSelect(client: ClientDto): Promise<void> {
    this.isCreating.set(false)
    this.viewMode.set('inbox')
    this.clientStore.select(client)
    await this.contactStore.loadByClientId(client.id)
  }

  onNew(type: ClientType): void {
    this.newClientType.set(type)

    if (this.isCreating()) {
      this.createPanel?.setType(type)
      return
    }

    const wasInTable = this.viewMode() === 'table'
    this.viewMode.set('inbox')
    this.clientStore.select(null)

    if (wasInTable) {
      setTimeout(() => this.isCreating.set(true), 180)
    } else {
      this.isCreating.set(true)
    }
  }

  async onCreateSubmit(data: CreateClientDto): Promise<void> {
    const created = await this.clientStore.add(data)
    if (created) {
      this.isCreating.set(false)
      await this.onSelect(created)
    }
  }

  onCreateCancel(): void { this.isCreating.set(false) }

  async onEditSave(data: UpdateClientDto): Promise<void> {
    await this.clientStore.update(data)
  }

  onRemoveRequest(id: number): void { this.pendingRemoveId.set(id) }

  async onRemoveConfirm(): Promise<void> {
    const id = this.pendingRemoveId()
    if (!id) return
    await this.clientStore.remove(id)
    this.pendingRemoveId.set(null)
  }

  async onContactSubmit(data: CreateContactDto | UpdateContactDto): Promise<void> {
    if ('id' in data) await this.contactStore.update(data as UpdateContactDto)
    else              await this.contactStore.add(data as CreateContactDto)
  }

  async onContactRemove(id: number): Promise<void> {
    await this.contactStore.remove(id)
  }

  onWidthChange(w: number): void { this.mainWidth.set(w) }

  onDraggingChange(d: boolean): void {
    this.dragging.set(d)
    if (!d) localStorage.setItem(MAIN_WIDTH_KEY, String(this.mainWidth()))
  }

  private readStoredWidth(): number {
    const raw = Number(localStorage.getItem(MAIN_WIDTH_KEY))
    return Number.isFinite(raw) && raw >= MAIN_WIDTH_MIN && raw <= MAIN_WIDTH_MAX ? raw : MAIN_WIDTH_DEFAULT
  }
}
