import { Component, computed, input, output, signal } from '@angular/core'
import { LucideMail, LucidePhone, LucideTrash2, LucidePlus } from '@lucide/angular'
import { ContactDto } from '@shared/dtos/client'
import { Avatar, Button, Card, SearchBar } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'

@Component({
  selector: 'app-contact-list',
  imports: [LucideMail, LucidePhone, LucideTrash2, LucidePlus, Avatar, Button, Card, SearchBar, TranslatePipe],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css',
})
export class ContactList {
  readonly contacts = input.required<ContactDto[]>()
  readonly loading  = input<boolean>(false)
  readonly embedded = input<boolean>(false)
  readonly add      = output<void>()
  readonly edit     = output<ContactDto>()
  readonly remove   = output<number>()

  readonly search   = signal<string>('')

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase()
    if (!q) return this.contacts()
    return this.contacts().filter(c =>
      [c.lastName, c.firstName, c.email, c.phone, c.role]
        .some(v => v?.toLowerCase().includes(q))
    )
  })

  readonly ButtonVariant = ButtonVariant
}
