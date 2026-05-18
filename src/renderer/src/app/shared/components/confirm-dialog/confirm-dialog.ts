import { Component, input, output } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'
import { Button } from '../button/button'
import { ButtonVariant } from '../../enums'

@Component({
  selector: 'app-confirm-dialog',
  imports: [Button, TranslatePipe],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly visible   = input<boolean>(false)
  readonly title     = input<string>('common.deleteConfirmTitle')
  readonly message   = input<string>('common.deleteConfirmMessage')
  readonly confirmed = output<void>()
  readonly cancelled = output<void>()

  readonly ButtonVariant = ButtonVariant
}
