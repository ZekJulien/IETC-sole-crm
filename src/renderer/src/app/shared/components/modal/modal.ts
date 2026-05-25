import { Component, DestroyRef, HostListener, effect, inject, input, output } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'

const modalStack: Modal[] = []

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

  constructor() {
    effect(() => {
      const i = modalStack.indexOf(this)
      if (this.open()) {
        if (i === -1) modalStack.push(this)
      } else if (i !== -1) {
        modalStack.splice(i, 1)
      }
    })
    inject(DestroyRef).onDestroy(() => {
      const i = modalStack.indexOf(this)
      if (i !== -1) modalStack.splice(i, 1)
    })
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && modalStack[modalStack.length - 1] === this) this.closed.emit()
  }
}
