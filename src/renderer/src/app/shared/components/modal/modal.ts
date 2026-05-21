import { Component, HostListener, input, output } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'

@Component({
  selector: 'app-modal',
  imports: [TranslatePipe],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  readonly open   = input<boolean>(false)
  readonly title  = input<string | null>(null)
  readonly width  = input<string>('420px')
  readonly closed = output<void>()

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit()
  }
}
