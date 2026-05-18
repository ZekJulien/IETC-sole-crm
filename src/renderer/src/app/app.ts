import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Navbar } from './layout/navbar/navbar'
import { Toaster } from './layout/toaster/toaster'
import { routeAnim } from './route.animations'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Toaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeAnim],
})
export class App {
  prepareRoute(outlet: RouterOutlet): string | null {
    return outlet?.isActivated ? outlet.activatedRoute.snapshot.routeConfig?.path ?? '' : null
  }
}
