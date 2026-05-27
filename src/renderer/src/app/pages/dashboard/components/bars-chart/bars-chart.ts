import { Component, computed, input } from '@angular/core'

export interface BarItem { label: string; value: number; color?: string }

@Component({
  selector: 'app-bars-chart',
  templateUrl: './bars-chart.html',
  styleUrl: './bars-chart.css',
})
export class BarsChart {
  readonly items       = input<BarItem[]>([])
  readonly formatValue = input<(n: number) => string>((n) => String(n))
  readonly accent      = input<string>('var(--color-accent)')
  readonly emptyLabel  = input<string>('')
  readonly limit       = input<number>(8)

  readonly rows = computed<BarItem[]>(() =>
    this.items()
      .filter(i => i.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, this.limit()),
  )
  readonly isEmpty = computed(() => this.rows().length === 0)
  readonly max     = computed(() => this.rows().reduce((m, i) => Math.max(m, i.value), 0) || 1)

  fmt(n: number): string {
    return this.formatValue()(n)
  }

  pct(item: BarItem): number {
    return (item.value / this.max()) * 100
  }
}
