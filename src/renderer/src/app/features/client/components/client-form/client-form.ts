import { Component, OnInit, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ClientDto, CreateClientDto, UpdateClientDto, ClientType } from '@shared/dtos/client'
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

  readonly client    = input<ClientDto | null>(null)
  readonly loading   = input<boolean>(false)
  readonly submitted = output<CreateClientDto | UpdateClientDto>()
  readonly cancelled = output<void>()

  readonly ClientType = ClientType

  readonly form = this.fb.group({
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

  ngOnInit(): void {
    const c = this.client()
    if (c) this.form.patchValue({ ...c })
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
}
