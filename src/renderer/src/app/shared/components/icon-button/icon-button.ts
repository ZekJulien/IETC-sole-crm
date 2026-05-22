import { Component, input, output } from '@angular/core'

export type IconButtonVariant = 'default' | 'danger'

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.css',
})
export class IconButton {
  readonly title    = input<string>('')
  readonly variant  = input<IconButtonVariant>('default')
  readonly disabled = input<boolean>(false)
  readonly clicked  = output<void>()

  onClick(event: MouseEvent): void {
    event.stopPropagation()
    if (!this.disabled()) this.clicked.emit()
  }
}
