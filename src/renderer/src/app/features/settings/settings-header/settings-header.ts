import { Component, Type, input } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { TranslatePipe } from '@app/pipes'

@Component({
  selector: 'app-settings-header',
  imports: [NgComponentOutlet, TranslatePipe],
  templateUrl: './settings-header.html',
  styleUrl: './settings-header.css',
})
export class SettingsHeader {
  readonly icon     = input.required<Type<unknown>>()
  readonly title    = input.required<string>()
  readonly subtitle = input<string>('')
}
