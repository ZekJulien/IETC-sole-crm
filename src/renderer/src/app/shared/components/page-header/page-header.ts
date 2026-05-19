import { Component, input, output } from '@angular/core'
import { LucideLayoutList, LucideTable2 } from '@lucide/angular'
import { ViewMode } from '../view-mode-switch/view-mode-switch'

@Component({
  selector: 'app-page-header',
  imports: [LucideLayoutList, LucideTable2],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly title      = input<string>('')
  readonly viewMode   = input<ViewMode | null>(null)
  readonly viewChange = output<ViewMode>()
}
