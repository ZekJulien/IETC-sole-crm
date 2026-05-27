import { Component, computed, input } from '@angular/core'

export interface ChartSeries {
  label:  string
  color:  string
  values: number[]
}

interface Bar { x: number; y: number; w: number; h: number; color: string; title: string }
interface GridLine { y: number; label: string }
interface XLabel { x: number; text: string }

const VIEW_W = 760
const VIEW_H = 260
const ML = 52, MR = 14, MT = 14, MB = 30
const PLOT_W = VIEW_W - ML - MR
const PLOT_H = VIEW_H - MT - MB

function niceMax(max: number): number {
  if (max <= 0) return 1
  const pow  = Math.pow(10, Math.floor(Math.log10(max)))
  const n    = max / pow
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return nice * pow
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
})
export class BarChart {
  readonly categories  = input<string[]>([])
  readonly series      = input<ChartSeries[]>([])
  readonly formatValue = input<(n: number) => string>((n) => String(n))
  readonly formatTick  = input<((n: number) => string) | null>(null)
  readonly emptyLabel  = input<string>('')

  readonly viewBox = `0 0 ${VIEW_W} ${VIEW_H}`
  readonly ML      = ML
  readonly MR      = MR
  readonly VIEW_W  = VIEW_W
  readonly VIEW_H  = VIEW_H

  readonly isEmpty = computed(() => this.series().every(s => s.values.every(v => !v)))

  readonly max = computed(() => {
    let m = 0
    for (const s of this.series()) for (const v of s.values) if (v > m) m = v
    return niceMax(m)
  })

  readonly gridlines = computed<GridLine[]>(() => {
    const max  = this.max()
    const fmt  = this.formatTick() ?? this.formatValue()
    const out: GridLine[] = []
    for (let i = 0; i <= 4; i++) {
      const frac = i / 4
      out.push({ y: MT + PLOT_H * (1 - frac), label: fmt(max * frac) })
    }
    return out
  })

  readonly bars = computed<Bar[]>(() => {
    const cats   = this.categories()
    const series = this.series()
    const max    = this.max()
    const fmt    = this.formatValue()
    const groupW = PLOT_W / (cats.length || 1)
    const areaW  = groupW * 0.68
    const barW   = areaW / (series.length || 1)
    const out: Bar[] = []
    for (let i = 0; i < cats.length; i++) {
      const startX = ML + i * groupW + (groupW - areaW) / 2
      for (let s = 0; s < series.length; s++) {
        const value = series[s].values[i] ?? 0
        const h     = max > 0 ? (value / max) * PLOT_H : 0
        out.push({
          x:     startX + s * barW,
          y:     MT + PLOT_H - h,
          w:     barW * 0.84,
          h,
          color: series[s].color,
          title: `${series[s].label} · ${cats[i]} : ${fmt(value)}`,
        })
      }
    }
    return out
  })

  readonly xLabels = computed<XLabel[]>(() => {
    const cats   = this.categories()
    const groupW = PLOT_W / (cats.length || 1)
    return cats.map((text, i) => ({ x: ML + i * groupW + groupW / 2, text }))
  })
}
