import { Component, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { LucidePlus, LucideUsers, LucideLayoutList, LucideTable2 } from '@lucide/angular'
import { ClientDto, CreateClientDto, UpdateClientDto, ClientType, ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { ClientStore } from '@app/stores/client/client-store'
import { ContactStore } from '@app/stores/client/contact-store'
import { I18nService } from '@app/services/i18n/i18n'
import { ViewMode, SearchBar, DataTable, StatusBadge, Avatar, Button, ConfirmDialog } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { TableColumn } from '@app/interfaces'
import { ClientForm, ContactList, ContactForm } from '../../components'
import { applyStaticClientValidators, syncCountryValidators, syncFirstNameValidator } from '../../utils/client-form-validators'
import { viewSwitchAnim } from './view-switch.animations'

const MAIN_WIDTH_KEY = 'client-list:main-width'
const MAIN_WIDTH_MIN = 200
const MAIN_WIDTH_MAX = 500
const MAIN_WIDTH_DEFAULT = 280

@Component({
  selector: 'app-client-list',
  imports: [ReactiveFormsModule, LucidePlus, LucideUsers, LucideLayoutList, LucideTable2, SearchBar, DataTable, StatusBadge, Avatar, Button, ConfirmDialog, TranslatePipe, ContactList, ClientForm, ContactForm],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
  animations: [viewSwitchAnim],
})
export class ClientList implements OnInit {
  private readonly fb      = inject(FormBuilder)
  private readonly i18n    = inject(I18nService)
  readonly clientStore     = inject(ClientStore)
  readonly contactStore    = inject(ContactStore)

  readonly viewMode          = signal<ViewMode>('inbox')
  readonly searchTerm        = signal<string>('')
  readonly mainWidth         = signal<number>(this.readStoredWidth())
  readonly dragging          = signal<boolean>(false)
  readonly isCreating        = signal<boolean>(false)
  readonly isEditing         = signal<boolean>(false)
  readonly showContactForm   = signal<boolean>(false)
  readonly editingContact    = signal<ContactDto | null>(null)
  readonly pendingRemoveId   = signal<number | null>(null)
  readonly newMenuOpen       = signal<boolean>(false)
  readonly newClientType     = signal<ClientType>(ClientType.COMPANY)

  readonly selectedClient    = computed(() => this.clientStore.selected())
  readonly hasPanel          = computed(() => this.isCreating() || this.clientStore.hasSelected())

  readonly ButtonVariant = ButtonVariant
  readonly ClientType    = ClientType

  @ViewChild(ClientForm) clientForm?: ClientForm

  readonly editForm = this.fb.group({
    name:          [''],
    firstName:     [''],
    email:         [''],
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
    { key: 'type',  labelKey: 'client.type',  sortable: true, type: 'badge', badgeI18nPrefix: 'client.type.' },
    { key: 'city',  labelKey: 'common.city',  sortable: true },
    { key: 'email', labelKey: 'common.email', sortable: true },
  ]

  async ngOnInit(): Promise<void> {
    // Validators dynamiques sur le editForm — même logique que app-client-form
    applyStaticClientValidators(this.editForm)
    syncFirstNameValidator(this.editForm, this.editForm.get('type')!.value as ClientType)
    this.editForm.get('type')!.valueChanges.subscribe(v => syncFirstNameValidator(this.editForm, v as ClientType))
    syncCountryValidators(this.editForm, this.editForm.get('country')!.value ?? '')
    this.editForm.get('country')!.valueChanges.subscribe(v => syncCountryValidators(this.editForm, v ?? ''))

    await this.clientStore.load()
  }

  async load(search?: string): Promise<void> {
    await this.clientStore.load({ search })
  }

  displayName(client: ClientDto): string {
    return client.firstName ? `${client.firstName} ${client.name}` : client.name
  }

  get isCompanyEdit(): boolean {
    return this.editForm.get('type')?.value === ClientType.COMPANY
  }

  /** Affichage de la section FACTURATION : type du form en édition, type du client en vue read-only. */
  get showBilling(): boolean {
    return this.isEditing()
      ? this.isCompanyEdit
      : this.selectedClient()?.type === ClientType.COMPANY
  }

  /** True si l'entité courante (form en édition, client en vue) est une entreprise. */
  get isCompanyCurrent(): boolean {
    return this.isEditing()
      ? this.isCompanyEdit
      : this.selectedClient()?.type === ClientType.COMPANY
  }

  /**
   * Renvoie le message d'erreur i18n pour un champ du editForm (null si valide ou pas touched).
   * `patternKey` permet de spécifier la clé i18n pour l'erreur pattern (ex: "phone", "postalCode").
   */
  editError(fieldName: string, patternKey: string = 'pattern'): string | null {
    const ctrl = this.editForm.get(fieldName)
    if (!ctrl?.invalid || !ctrl.touched) return null
    const e = ctrl.errors
    if (e?.['required'])  return this.i18n.t('required')
    if (e?.['email'])     return this.i18n.t('email')
    if (e?.['minlength']) return this.i18n.t('minlength', { min: e['minlength'].requiredLength })
    if (e?.['pattern'])   return this.i18n.t(patternKey)
    return this.i18n.t('unknown')
  }

  readonly tableClients = computed(() =>
    this.clientStore.clients().map(c => ({ ...c, name: this.displayName(c) }))
  )

  async onTableRowClick(row: ClientDto): Promise<void> {
    const original = this.clientStore.clients().find(c => c.id === row.id)
    if (!original) return
    this.viewMode.set('inbox')
    await this.onSelect(original)
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
  toggleNewMenu(): void { this.newMenuOpen.update(v => !v) }

  onNew(type: ClientType): void {
    this.newMenuOpen.set(false)
    this.newClientType.set(type)

    // Form déjà ouvert : on switch juste le type, on garde la saisie de l'utilisateur
    if (this.isCreating()) {
      this.clientForm?.setType(type)
      return
    }

    const wasInTable = this.viewMode() === 'table'
    this.viewMode.set('inbox')
    this.clientStore.select(null)
    this.isEditing.set(false)
    this.showContactForm.set(false)

    if (wasInTable) {
      setTimeout(() => this.isCreating.set(true), 180)
    } else {
      this.isCreating.set(true)
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocClick(e: PointerEvent): void {
    if (!this.newMenuOpen()) return
    const target = e.target as HTMLElement
    if (!target.closest('.new-dropdown')) this.newMenuOpen.set(false)
  }

  /**
   * Focus trap : quand le form de création est ouvert, Tab cycle entre ses focusables
   * (Type → ... → Notes → Annuler → Enregistrer → Type → ...).
   */
  @HostListener('document:keydown', ['$event'])
  onFormTab(e: KeyboardEvent): void {
    if (e.key !== 'Tab' || !this.isCreating()) return
    const form = document.querySelector('.inbox-detail--form') as HTMLElement | null
    if (!form) return

    const focusables = Array.from(form.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null)  // exclut les éléments cachés

    if (focusables.length === 0) return

    const first  = focusables[0]
    const last   = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement

    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
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

  // ── Main panel resize ────────────────────────────
  startDrag(): void { this.dragging.set(true) }

  @HostListener('window:pointermove', ['$event'])
  onDrag(e: PointerEvent): void {
    if (!this.dragging()) return
    e.preventDefault()
    const next = Math.min(MAIN_WIDTH_MAX, Math.max(MAIN_WIDTH_MIN, e.clientX - this.hostLeft()))
    this.mainWidth.set(next)
  }

  @HostListener('window:pointerup')
  endDrag(): void {
    if (!this.dragging()) return
    this.dragging.set(false)
    localStorage.setItem(MAIN_WIDTH_KEY, String(this.mainWidth()))
  }

  private hostLeft(): number {
    return (document.querySelector('app-client-list') as HTMLElement | null)?.getBoundingClientRect().left ?? 0
  }

  private readStoredWidth(): number {
    const raw = Number(localStorage.getItem(MAIN_WIDTH_KEY))
    return Number.isFinite(raw) && raw >= MAIN_WIDTH_MIN && raw <= MAIN_WIDTH_MAX ? raw : MAIN_WIDTH_DEFAULT
  }
}
