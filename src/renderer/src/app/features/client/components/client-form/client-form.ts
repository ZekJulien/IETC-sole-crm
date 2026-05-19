import { Component, OnInit, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { ClientDto, CreateClientDto, UpdateClientDto, ClientType } from '@shared/dtos/client'
import { applyStaticClientValidators, syncCountryValidators, syncFirstNameValidator } from '../../utils/client-form-validators'
import { FormField, FormActions } from '@app/components'
import { TranslatePipe } from '@app/pipes'

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule, FormField, FormActions, TranslatePipe],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm implements OnInit {
  private readonly fb = inject(FormBuilder)

  readonly client      = input<ClientDto | null>(null)
  readonly loading     = input<boolean>(false)
  readonly showActions = input<boolean>(true)
  readonly initialType = input<ClientType>(ClientType.COMPANY)
  readonly submitted   = output<CreateClientDto | UpdateClientDto>()
  readonly cancelled   = output<void>()

  submit(): void { this.onSubmit() }
  setType(type: ClientType): void { this.form.get('type')?.setValue(type) }

  readonly ClientType = ClientType

  readonly form = this.fb.group({
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

  ngOnInit(): void {
    applyStaticClientValidators(this.form)

    const c = this.client()
    if (c) this.form.patchValue({ ...c })
    else   this.form.patchValue({ type: this.initialType() })

    syncFirstNameValidator(this.form, this.form.get('type')!.value as ClientType)
    this.form.get('type')!.valueChanges.subscribe(v => syncFirstNameValidator(this.form, v as ClientType))

    syncCountryValidators(this.form, this.form.get('country')!.value ?? '')
    this.form.get('country')!.valueChanges.subscribe(v => syncCountryValidators(this.form, v ?? ''))
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const val = this.form.getRawValue() as CreateClientDto
    const existing = this.client()
    if (existing) {
      this.submitted.emit({ ...val, id: existing.id } as UpdateClientDto)
    } else {
      this.submitted.emit(val)
    }
  }

  get isEdit(): boolean { return !!this.client() }
  get isCompany(): boolean { return this.form.get('type')?.value === ClientType.COMPANY }
}
