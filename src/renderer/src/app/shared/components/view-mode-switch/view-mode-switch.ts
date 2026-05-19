import { Component, input, output } from '@angular/core'
import { LucideLayoutList, LucideTable2 } from '@lucide/angular'
import { TranslatePipe } from '@app/pipes'

export type ViewMode = 'inbox' | 'table'

@Component({
  selector: 'app-view-mode-switch',
  imports: [LucideLayoutList, LucideTable2, TranslatePipe],
  templateUrl: './view-mode-switch.html',
  styleUrl: './view-mode-switch.css',
})
export class ViewModeSwitch {
  readonly mode       = input.required<ViewMode>()
  readonly modeChange = output<ViewMode>()

  set(mode: ViewMode): void {
    if (this.mode() !== mode) this.modeChange.emit(mode)
  }
}
