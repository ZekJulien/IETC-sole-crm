import { Component, effect, inject, untracked } from '@angular/core'
import { Modal } from '@app/components'
import { PomodoroStore } from '@app/stores/pomodoro'
import { ProjectStore } from '@app/stores/project'
import { PomodoroTimer } from '../pomodoro-timer/pomodoro-timer'

@Component({
  selector: 'app-pomodoro-panel',
  imports: [Modal, PomodoroTimer],
  templateUrl: './pomodoro-panel.html',
  styleUrl: './pomodoro-panel.css',
})
export class PomodoroPanel {
  readonly store    = inject(PomodoroStore)
  readonly projects = inject(ProjectStore)

  constructor() {
    effect(() => {
      if (this.store.panelOpen() && untracked(() => this.projects.projects().length) === 0) {
        void this.projects.load()
      }
    })
  }
}
