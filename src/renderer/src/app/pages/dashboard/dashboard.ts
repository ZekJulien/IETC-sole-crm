import { Component, inject } from '@angular/core'
import { LayoutService } from '../../services/layout/layout.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly _layout = inject(LayoutService)

  constructor() {
    this._layout.setTitle('Dashboard')
  }
}
