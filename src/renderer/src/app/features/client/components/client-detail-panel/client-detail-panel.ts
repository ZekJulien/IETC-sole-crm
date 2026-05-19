import { Component, inject, input, linkedSignal, output, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { LucidePlus } from '@lucide/angular'
import {
  ClientDto, ClientType, UpdateClientDto,
  ContactDto, CreateContactDto, UpdateContactDto,
} from '@shared/dtos/client'
import { Button, ConfirmDialog, StatusBadge, ViewField } from '@app/components'
import { ButtonVariant } from '@app/enums'
import { TranslatePipe } from '@app/pipes'
import { ContactList } from '../contact-list/contact-list'
import { ContactForm } from '../contact-form/contact-form'
import { displayClientName } from '../../utils/client-display'
import {
  clientValidators,
  companyNumberValidator,
  firstNameValidator,
  vatNumberValidator,
  zipCodeValidator,
} from '../../utils/client-form-validators'

@Component({
  selector: 'app-client-detail-panel',
  imports: [ReactiveFormsModule, LucidePlus, Button, ConfirmDialog, StatusBadge, ViewField, ContactList, ContactForm, TranslatePipe],
  templateUrl: './client-detail-panel.html',
  styleUrl: './client-detail-panel.css',
})
export class ClientDetailPanel {
  private readonly fb = inject(FormBuilder)

  readonly client   = input.required<ClientDto>()
  readonly contacts = input<ContactDto[]>([])
  readonly saving   = input<boolean>(false)

  readonly save          = output<UpdateClientDto>()
  readonly deleted       = output<number>()
  readonly contactSubmit = output<CreateContactDto | UpdateContactDto>()
  readonly contactRemove = output<number>()

  readonly mode = linkedSignal<number, 'view' | 'edit'>({
    source: () => this.client().id,
    computation: () => 'view',
  })

  readonly showContactForm = linkedSignal<number, boolean>({
    source: () => this.client().id,
    computation: () => false,
  })
  readonly editingContact         = signal<ContactDto | null>(null)
  readonly pendingContactRemoveId = signal<number | null>(null)

  readonly ButtonVariant = ButtonVariant
  readonly ClientType    = ClientType

  readonly form = this.fb.group({
    name:          ['', clientValidators.name],
    firstName:     ['', firstNameValidator],
    email:         ['', clientValidators.email],
    phone:         ['', clientValidators.phone],
    street:        [''],
    zipCode:       ['', zipCodeValidator],
    city:          [''],
    country:       [''],
    type:          [ClientType.COMPANY as string],
    companyNumber: ['', companyNumberValidator],
    vatNumber:     ['', vatNumberValidator],
    peppolId:      ['', clientValidators.peppolId],
    notes:         [''],
  })


  readonly displayName = displayClientName

  get isCompanyCurrent(): boolean {
    return this.mode() === 'edit'
      ? this.form.get('type')?.value === ClientType.COMPANY
      : this.client().type === ClientType.COMPANY
  }

  get showBilling(): boolean { return this.isCompanyCurrent }

  startEdit(): void {
    this.form.patchValue({ ...this.client() })
    this.mode.set('edit')
  }

  cancelEdit(): void { this.mode.set('view') }

  saveEdit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const val = this.form.getRawValue()
    this.save.emit({ ...val, id: this.client().id } as UpdateClientDto)
    this.mode.set('view')
  }

  onTypeChange(): void { this.form.get('firstName')!.updateValueAndValidity() }

  onCountryChange(): void {
    this.form.get('zipCode')!.updateValueAndValidity()
    this.form.get('vatNumber')!.updateValueAndValidity()
    this.form.get('companyNumber')!.updateValueAndValidity()
  }

  onContactAdd(): void {
    this.editingContact.set(null)
    this.showContactForm.set(true)
  }

  onContactEdit(contact: ContactDto): void {
    this.editingContact.set(contact)
    this.showContactForm.set(true)
  }

  onContactSubmit(data: CreateContactDto | UpdateContactDto): void {
    this.contactSubmit.emit(data)
    this.showContactForm.set(false)
    this.editingContact.set(null)
  }

  onContactCancel(): void {
    this.showContactForm.set(false)
    this.editingContact.set(null)
  }

  onContactRemoveRequest(id: number): void { this.pendingContactRemoveId.set(id) }

  onContactRemoveConfirm(): void {
    const id = this.pendingContactRemoveId()
    if (id == null) return
    this.contactRemove.emit(id)
    this.pendingContactRemoveId.set(null)
  }
}
