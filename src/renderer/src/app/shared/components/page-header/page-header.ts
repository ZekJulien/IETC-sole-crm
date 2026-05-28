import { Component, Type, input } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { TranslatePipe } from '../../pipes/translate-pipe'

@Component({
  selector: 'app-page-header',
  imports: [NgComponentOutlet, TranslatePipe],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly icon     = input<Type<unknown> | null>(null)
  readonly title    = input<string>('')
  readonly subtitle = input<string>('')
}
