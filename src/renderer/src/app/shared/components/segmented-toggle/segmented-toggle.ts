import { Component, Type, input, output } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { TranslatePipe } from '../../pipes/translate-pipe'

export interface SegmentedOption {
  value:     string
  icon:      Type<unknown>
  titleKey?: string
}

@Component({
  selector: 'app-segmented-toggle',
  imports: [NgComponentOutlet, TranslatePipe],
  templateUrl: './segmented-toggle.html',
  styleUrl: './segmented-toggle.css',
})
export class SegmentedToggle {
  readonly options     = input.required<SegmentedOption[]>()
  readonly value       = input.required<string>()
  readonly valueChange = output<string>()

  select(value: string): void {
    if (this.value() !== value) this.valueChange.emit(value)
  }
}
