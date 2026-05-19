import { Component, input, model, output } from '@angular/core'
import { LucidePlus } from '@lucide/angular'
import { ClientDto, ClientType } from '@shared/dtos/client'
import { Avatar, SearchBar, StatusBadge, SplitButton, SplitButtonItem, ViewModeSwitch, ViewMode } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ClientTableView } from '../client-table-view/client-table-view'
import { displayClientName } from '../../utils/client-display'
import { viewSwitchAnim } from './view-switch.animations'

@Component({
  selector: 'app-client-list-panel',
  imports: [LucidePlus, Avatar, SearchBar, StatusBadge, SplitButton, ViewModeSwitch, ClientTableView, TranslatePipe],
  templateUrl: './client-list-panel.html',
  styleUrl: './client-list-panel.css',
  animations: [viewSwitchAnim],
})
export class ClientListPanel {
  readonly clients    = input.required<ClientDto[]>()
  readonly selectedId = input<number | null>(null)
  readonly loading    = input<boolean>(false)

  readonly viewMode   = model.required<ViewMode>()
  readonly searchTerm = model<string>('')

  readonly select    = output<ClientDto>()
  readonly search    = output<string>()
  readonly newClient = output<ClientType>()

  readonly newItems: SplitButtonItem[] = [
    { key: ClientType.COMPANY,    labelKey: 'client.type.company' },
    { key: ClientType.INDIVIDUAL, labelKey: 'client.type.individual' },
  ]

  readonly displayName = displayClientName

  onSplitSelected(key: string): void {
    this.newClient.emit(key as ClientType)
  }
}
