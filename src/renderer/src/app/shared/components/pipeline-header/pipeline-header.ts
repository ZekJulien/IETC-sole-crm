import { Component, computed, input, output } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { statusKey } from '../../utils'

@Component({
  selector: 'app-pipeline-header',
  imports: [TranslatePipe],
  templateUrl: './pipeline-header.html',
  styleUrl: './pipeline-header.css',
})
export class PipelineHeader {
  readonly statuses     = input.required<string[]>()
  readonly counts       = input.required<Record<string, number>>()
  readonly selected     = input<string>('')
  readonly statusPrefix = input.required<string>()
  readonly allLabelKey  = input.required<string>()

  readonly select = output<string>()

  readonly totalCount = computed(() =>
    Object.values(this.counts()).reduce((sum, n) => sum + n, 0)
  )

  count(status: string): number {
    return this.counts()[status] ?? 0
  }

  labelKey(status: string): string {
    return statusKey(this.statusPrefix(), status)
  }
}
