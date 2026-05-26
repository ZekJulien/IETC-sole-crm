import { Component, input, output } from '@angular/core'

@Component({
  selector: 'app-switch',
  templateUrl: './switch.html',
  styleUrl: './switch.css',
})
export class Switch {
  readonly checked = input<boolean>(false)
  readonly toggled = output<void>()
}
