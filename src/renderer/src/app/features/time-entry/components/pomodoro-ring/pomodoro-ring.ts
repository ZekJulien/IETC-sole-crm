import { Component, computed, input } from '@angular/core'
import { PomodoroPhase } from '@app/stores/pomodoro'

@Component({
  selector: 'app-pomodoro-ring',
  templateUrl: './pomodoro-ring.html',
  styleUrl: './pomodoro-ring.css',
})
export class PomodoroRing {
  readonly progress = input<number>(0)
  readonly phase    = input<PomodoroPhase>('WORK')

  readonly circumference = 2 * Math.PI * 52
  readonly dashOffset = computed(() => this.circumference * Math.min(1, Math.max(0, this.progress())))
  readonly color = computed(() => {
    switch (this.phase()) {
      case 'SHORT_BREAK': return 'var(--color-success)'
      case 'LONG_BREAK':  return 'var(--color-info)'
      default:            return 'var(--color-danger)'
    }
  })
}
