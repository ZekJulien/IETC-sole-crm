import { Component, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { Button, ViewField } from '@app/components'
import { ButtonVariant } from '@app/enums'
import { TranslatePipe } from '@app/pipes'

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, Button, ViewField, TranslatePipe],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  private readonly fb = inject(FormBuilder)

  readonly contact   = input<ContactDto | null>(null)
  readonly clientId  = input.required<number>()
  readonly loading   = input<boolean>(false)
  readonly submitted = output<CreateContactDto | UpdateContactDto>()
  readonly cancelled = output<void>()

  get titleKey(): string {
    return this.contact() ? 'contact.edit' : 'contact.new'
  }

  readonly ButtonVariant = ButtonVariant

  readonly form = this.fb.group({
    lastName:  ['', [Validators.required]],
    firstName: [''],
    email:     ['', [Validators.email]],
    phone:     [''],
    role:      [''],
  })

  constructor() {
    effect(() => {
      const c = this.contact()
      this.form.reset({
        lastName:  c?.lastName  ?? '',
        firstName: c?.firstName ?? '',
        email:     c?.email     ?? '',
        phone:     c?.phone     ?? '',
        role:      c?.role      ?? '',
      })
    })
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const val = this.form.getRawValue()
    const existing = this.contact()
    if (existing) {
      this.submitted.emit({ ...val, id: existing.id } as UpdateContactDto)
    } else {
      this.submitted.emit({ ...val, clientId: this.clientId() } as CreateContactDto)
    }
  }
}
