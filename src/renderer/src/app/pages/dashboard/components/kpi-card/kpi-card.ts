import { Component, input } from '@angular/core'

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
})
export class KpiCard {
  readonly value  = input<string | number>('')
  readonly hint   = input<string | null>(null)
  readonly accent = input<string>('mauve')
}
