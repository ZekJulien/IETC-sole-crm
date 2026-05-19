import { Component, input, output } from '@angular/core'
import { ButtonVariant } from '../../enums'

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  readonly variant  = input<ButtonVariant>(ButtonVariant.PRIMARY)
  readonly type     = input<'button' | 'submit' | 'reset'>('button')
  readonly loading  = input<boolean>(false)
  readonly disabled = input<boolean>(false)
  readonly tabindex = input<number>(0)
  readonly clicked  = output<void>()

  readonly ButtonVariant = ButtonVariant
}
