import { Component, input } from '@angular/core'

export interface PipelineSegment { label: string; value: number; color: string }
export interface PipelineRow { label: string; segments: PipelineSegment[] }

@Component({
  selector: 'app-pipeline-chart',
  templateUrl: './pipeline-chart.html',
  styleUrl: './pipeline-chart.css',
})
export class PipelineChart {
  readonly rows = input<PipelineRow[]>([])

  total(row: PipelineRow): number {
    return row.segments.reduce((s, x) => s + x.value, 0)
  }

  pct(seg: PipelineSegment, row: PipelineRow): number {
    const t = this.total(row)
    return t > 0 ? (seg.value / t) * 100 : 0
  }
}
