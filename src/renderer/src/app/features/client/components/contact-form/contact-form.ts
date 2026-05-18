import { Component, OnInit, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'
import { FormField, FormActions } from '@app/components'
import { TranslatePipe } from '@app/pipes'

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, FormField, FormActions, TranslatePipe],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm implements OnInit {
  private readonly fb = inject(FormBuilder)

  readonly contact   = input<ContactDto | null>(null)
  readonly clientId  = input.required<number>()
  readonly loading   = input<boolean>(false)
  readonly submitted = output<CreateContactDto | UpdateContactDto>()
  readonly cancelled = output<void>()

  readonly form = this.fb.group({
    lastName:  ['', [Validators.required]],
    firstName: [''],
    email:     ['', [Validators.email]],
    phone:     [''],
    role:      [''],
  })

  ngOnInit(): void {
    const c = this.contact()
    if (c) this.form.patchValue({ ...c })
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
