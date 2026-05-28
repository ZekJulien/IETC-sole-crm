import { Component, input, output } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'

@Component({
  selector: 'app-color-picker',
  imports: [TranslatePipe],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.css',
})
export class ColorPicker {
  readonly labelKey = input.required<string>()
  readonly palette  = input.required<readonly string[]>()
  readonly selected = input.required<string>()

  readonly pick = output<string>()
}
