import { Component, computed, inject } from '@angular/core'
import { LucideTimer, LucidePause } from '@lucide/angular'
import { PomodoroStore } from '@app/stores/pomodoro'
import { TranslatePipe } from '@app/pipes'
import { formatClock } from '@app/utils'

@Component({
  selector: 'app-pomodoro-indicator',
  imports: [TranslatePipe, LucideTimer, LucidePause],
  templateUrl: './pomodoro-indicator.html',
  styleUrl: './pomodoro-indicator.css',
})
export class PomodoroIndicator {
  readonly store = inject(PomodoroStore)

  readonly clock = computed(() => formatClock(this.store.displaySeconds()))

  readonly phaseLabelKey = computed(() => {
    switch (this.store.phase()) {
      case 'SHORT_BREAK': return 'time.pomo.phase.shortBreak'
      case 'LONG_BREAK':  return 'time.pomo.phase.longBreak'
      default:            return 'time.pomo.phase.work'
    }
  })
}
