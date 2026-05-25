import { Component, input, output } from '@angular/core'
import {
  LucideCalendar, LucideBanknote, LucideTimer,
  LucidePencil, LucideTrash2,
} from '@lucide/angular'
import { TimeEntryDto } from '@shared/dtos/time-entry'
import { IconButton } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { formatDate } from '@app/utils'
import { formatDuration } from '../../utils/format-duration'

@Component({
  selector: 'app-time-entry-list',
  imports: [
    IconButton, TranslatePipe,
    LucideCalendar, LucideBanknote, LucideTimer, LucidePencil, LucideTrash2,
  ],
  templateUrl: './time-entry-list.html',
  styleUrl: './time-entry-list.css',
})
export class TimeEntryList {
  readonly entries = input.required<TimeEntryDto[]>()

  readonly editEntry   = output<TimeEntryDto>()
  readonly deleteEntry = output<TimeEntryDto>()

  readonly formatDate     = formatDate
  readonly formatDuration = formatDuration
}
