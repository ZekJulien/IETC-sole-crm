import { Component, computed, input, output } from '@angular/core'
import { ClientDto } from '@shared/dtos/client'
import { DataTable } from '@app/components'
import { TableColumn } from '@app/interfaces'
import { displayClientName } from '../../utils/client-display'

@Component({
  selector: 'app-client-table-view',
  imports: [DataTable],
  templateUrl: './client-table-view.html',
  styleUrl: './client-table-view.css',
})
export class ClientTableView {
  readonly clients  = input.required<ClientDto[]>()
  readonly loading  = input<boolean>(false)
  readonly rowClick = output<ClientDto>()

  readonly columns: TableColumn<ClientDto>[] = [
    { key: 'name',  labelKey: 'common.name',  sortable: true },
    { key: 'type',  labelKey: 'client.type',  sortable: true, type: 'badge', badgeI18nPrefix: 'client.type.' },
    { key: 'city',  labelKey: 'common.city',  sortable: true },
    { key: 'email', labelKey: 'common.email', sortable: true },
  ]

  /** Vue avec name = displayName (firstName + name) pour affichage. */
  readonly tableData = computed(() =>
    this.clients().map(c => ({ ...c, name: displayClientName(c) }))
  )

  onRowClick(row: ClientDto): void {
    const original = this.clients().find(c => c.id === row.id)
    if (original) this.rowClick.emit(original)
  }
}
