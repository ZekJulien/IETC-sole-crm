import { Component, input, output, signal } from '@angular/core'
import { TranslatePipe } from '@app/pipes'
import { ClickOutside } from '@app/directives'

export interface SplitButtonItem {
  key:      string
  labelKey: string
}

export type SplitButtonMenuPosition = 'above' | 'below'

@Component({
  selector: 'app-split-button',
  imports: [TranslatePipe, ClickOutside],
  templateUrl: './split-button.html',
  styleUrl: './split-button.css',
})
export class SplitButton {
  readonly items    = input.required<SplitButtonItem[]>()
  readonly position = input<SplitButtonMenuPosition>('above')

  readonly selected = output<string>()

  readonly open = signal<boolean>(false)

  toggle(): void { this.open.update(v => !v) }
  close():  void { this.open.set(false) }

  onSelect(key: string): void {
    this.open.set(false)
    this.selected.emit(key)
  }
}
