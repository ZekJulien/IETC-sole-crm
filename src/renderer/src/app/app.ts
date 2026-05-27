import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Navbar } from './layout/navbar/navbar'
import { Toaster } from './layout/toaster/toaster'
import { WelcomeWizard } from './features/welcome-wizard/welcome-wizard'
import { PomodoroPanel } from './features/time-entry/components/pomodoro-panel/pomodoro-panel'
import { WizardService } from '@app/services/wizard/wizard'
import { PomodoroStore } from '@app/stores/pomodoro'
import { routeAnim } from './route.animations'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Toaster, WelcomeWizard, PomodoroPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeAnim],
})
export class App {
  readonly wizard   = inject(WizardService)
  readonly pomodoro = inject(PomodoroStore)

  prepareRoute(outlet: RouterOutlet): string | null {
    return outlet?.isActivated ? outlet.activatedRoute.snapshot.routeConfig?.path ?? '' : null
  }
}
