import { Component, computed, input } from '@angular/core'

export interface DonutItem { label: string; value: number; color: string }

interface Slice { d: string; color: string; title: string; label: string; value: number; isFull: boolean }

const CX = 100, CY = 100, R = 82, RIN = 52
const RING_R = (R + RIN) / 2
const RING_W = R - RIN

function polar(radius: number, angle: number): [number, number] {
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]
}

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.css',
})
export class DonutChart {
  readonly items       = input<DonutItem[]>([])
  readonly formatValue = input<(n: number) => string>((n) => String(n))
  readonly centerLabel = input<string>('')
  readonly emptyLabel  = input<string>('')

  readonly CX    = CX
  readonly CY    = CY
  readonly ringR = RING_R
  readonly ringW = RING_W

  readonly positive = computed(() => this.items().filter(i => i.value > 0))
  readonly total    = computed(() => this.positive().reduce((s, i) => s + i.value, 0))
  readonly isEmpty  = computed(() => this.total() <= 0)

  readonly slices = computed<Slice[]>(() => {
    const items = this.positive()
    const total = this.total()
    if (total <= 0) return []
    if (items.length === 1) {
      const it = items[0]
      return [{ d: '', color: it.color, title: `${it.label} : ${this.fmt(it.value)}`, label: it.label, value: it.value, isFull: true }]
    }
    const out: Slice[] = []
    let a0 = -Math.PI / 2
    for (const it of items) {
      const a1 = a0 + (it.value / total) * Math.PI * 2
      const [ox0, oy0] = polar(R, a0)
      const [ox1, oy1] = polar(R, a1)
      const [ix1, iy1] = polar(RIN, a1)
      const [ix0, iy0] = polar(RIN, a0)
      const large = a1 - a0 > Math.PI ? 1 : 0
      const d = `M ${ox0.toFixed(2)} ${oy0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${ox1.toFixed(2)} ${oy1.toFixed(2)} `
        + `L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${RIN} ${RIN} 0 ${large} 0 ${ix0.toFixed(2)} ${iy0.toFixed(2)} Z`
      out.push({ d, color: it.color, title: `${it.label} : ${this.fmt(it.value)}`, label: it.label, value: it.value, isFull: false })
      a0 = a1
    }
    return out
  })

  fmt(n: number): string {
    return this.formatValue()(n)
  }
}
