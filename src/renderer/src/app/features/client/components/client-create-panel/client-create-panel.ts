import { Component, ViewChild, input, output } from '@angular/core'
import { ClientType, CreateClientDto, UpdateClientDto } from '@shared/dtos/client'
import { Button, StatusBadge } from '@app/components'
import { ButtonVariant } from '@app/enums'
import { FocusTrap } from '@app/directives'
import { TranslatePipe } from '@app/pipes'
import { ClientForm } from '../client-form/client-form'

@Component({
  selector: 'app-client-create-panel',
  imports: [Button, StatusBadge, FocusTrap, ClientForm, TranslatePipe],
  templateUrl: './client-create-panel.html',
  styleUrl: './client-create-panel.css',
})
export class ClientCreatePanel {
  readonly initialType = input<ClientType>(ClientType.COMPANY)
  readonly saving      = input<boolean>(false)
  readonly submitted   = output<CreateClientDto>()
  readonly cancelled   = output<void>()

  readonly ButtonVariant = ButtonVariant

  @ViewChild(ClientForm) clientForm?: ClientForm

  setType(type: ClientType): void { this.clientForm?.setType(type) }

  onChildSubmit(data: CreateClientDto | UpdateClientDto): void {
    this.submitted.emit(data as CreateClientDto)
  }

  triggerSubmit(): void { this.clientForm?.submit() }
}
