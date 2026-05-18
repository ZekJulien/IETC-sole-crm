import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { LucidePlus, LucidePencil, LucideTrash2, LucideUsers, LucideX, LucideCheck, LucideLayoutList, LucideTable2 } from '@lucide/angular'
import { ClientDto, CreateClientDto, UpdateClientDto, ClientType, ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { ClientStore } from '@app/stores/client/client-store'
import { ContactStore } from '@app/stores/client/contact-store'
import { LayoutService } from '@app/services/layout/layout.service'
import { ViewMode, SearchBar, DataTable, InboxLayout, StatusBadge, Avatar, Button, ConfirmDialog } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { TableColumn } from '@app/interfaces'
import { ClientForm, ContactList, ContactForm } from '../../components'

@Component({
  selector: 'app-client-list',
  imports: [ReactiveFormsModule, LucidePlus, LucidePencil, LucideTrash2, LucideUsers, LucideX, LucideCheck, LucideLayoutList, LucideTable2, SearchBar, DataTable, InboxLayout, StatusBadge, Avatar, Button, ConfirmDialog, TranslatePipe, ContactList, ClientForm, ContactForm],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit {
  private readonly fb      = inject(FormBuilder)
  private readonly layout  = inject(LayoutService)
  readonly clientStore     = inject(ClientStore)
  readonly contactStore    = inject(ContactStore)

  readonly viewMode          = signal<ViewMode>('inbox')
  readonly isCreating        = signal<boolean>(false)
  readonly isEditing         = signal<boolean>(false)
  readonly showContactForm   = signal<boolean>(false)
  readonly editingContact    = signal<ContactDto | null>(null)
  readonly pendingRemoveId   = signal<number | null>(null)

  readonly selectedClient    = computed(() => this.clientStore.selected())
  readonly hasPanel          = computed(() => this.isCreating() || this.clientStore.hasSelected())

  readonly ButtonVariant = ButtonVariant
  readonly ClientType    = ClientType

  readonly editForm = this.fb.group({
    name:          ['', [Validators.required, Validators.minLength(2)]],
    email:         ['', [Validators.email]],
    phone:         [''],
    street:        [''],
    zipCode:       [''],
    city:          [''],
    country:       [''],
    type:          [ClientType.COMPANY as string],
    companyNumber: [''],
    vatNumber:     [''],
    peppolId:      [''],
    notes:         [''],
  })

  readonly columns: TableColumn<ClientDto>[] = [
    { key: 'name',  labelKey: 'common.name',  sortable: true },
    { key: 'type',  labelKey: 'client.type',  sortable: true, type: 'badge' },
    { key: 'city',  labelKey: 'common.city',  sortable: true },
    { key: 'email', labelKey: 'common.email', sortable: true },
  ]

  async ngOnInit(): Promise<void> {
    this.layout.setTitle('Clients')
    await this.clientStore.load()
  }

  async load(search?: string): Promise<void> {
    await this.clientStore.load({ search })
  }

  async onSelect(client: ClientDto): Promise<void> {
    this.isCreating.set(false)
    this.isEditing.set(false)
    this.showContactForm.set(false)
    this.editingContact.set(null)
    this.clientStore.select(client)
    await this.contactStore.loadByClientId(client.id)
  }

  // ── Client create ────────────────────────────────
  onNew(): void {
    this.clientStore.select(null)
    this.isCreating.set(true)
    this.isEditing.set(false)
    this.showContactForm.set(false)
  }

  async onCreateSubmit(data: CreateClientDto): Promise<void> {
    const created = await this.clientStore.add(data)
    if (created) {
      this.isCreating.set(false)
      await this.onSelect(created)
    }
  }

  onCreateCancel(): void { this.isCreating.set(false) }

  // ── Client edit inline (même layout) ─────────────
  onEditStart(): void {
    const c = this.selectedClient()
    if (!c) return
    this.editForm.patchValue({ ...c })
    this.isEditing.set(true)
  }

  async onEditSave(): Promise<void> {
    const sel = this.selectedClient()
    if (!sel) return
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return }
    const val = this.editForm.getRawValue()
    const updated = await this.clientStore.update({ ...val, id: sel.id } as UpdateClientDto)
    if (updated) this.isEditing.set(false)
  }

  onEditCancel(): void { this.isEditing.set(false) }

  // ── Contact inline ───────────────────────────────
  onContactAdd(): void {
    this.editingContact.set(null)
    this.showContactForm.set(true)
  }

  onContactEdit(contact: ContactDto): void {
    this.editingContact.set(contact)
    this.showContactForm.set(true)
  }

  async onContactSubmit(data: CreateContactDto | UpdateContactDto): Promise<void> {
    if ('id' in data) await this.contactStore.update(data as UpdateContactDto)
    else              await this.contactStore.add(data as CreateContactDto)
    this.showContactForm.set(false)
    this.editingContact.set(null)
  }

  async onContactRemove(id: number): Promise<void> {
    await this.contactStore.remove(id)
  }

  // ── Client remove ────────────────────────────────
  onRemoveRequest(id: number): void { this.pendingRemoveId.set(id) }

  async onRemoveConfirm(): Promise<void> {
    const id = this.pendingRemoveId()
    if (!id) return
    await this.clientStore.remove(id)
    this.pendingRemoveId.set(null)
  }
}
