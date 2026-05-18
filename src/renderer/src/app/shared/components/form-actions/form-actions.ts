import { Component, input, output } from '@angular/core'
import { Button } from '../button/button'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { ButtonVariant } from '../../enums'

@Component({
  selector: 'app-form-actions',
  imports: [Button, TranslatePipe],
  templateUrl: './form-actions.html',
  styleUrl: './form-actions.css',
})
export class FormActions {
  readonly loading   = input<boolean>(false)
  readonly cancelled = output<void>()

  readonly ButtonVariant = ButtonVariant
}
