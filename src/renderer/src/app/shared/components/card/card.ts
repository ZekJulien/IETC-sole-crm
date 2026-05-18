import { Component, input, output } from '@angular/core'

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  readonly clickable = input<boolean>(false)
  readonly active    = input<boolean>(false)
  readonly clicked   = output<void>()
}
