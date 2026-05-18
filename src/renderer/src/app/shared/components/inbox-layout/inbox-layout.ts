import { Component, input } from '@angular/core'

@Component({
  selector: 'app-inbox-layout',
  templateUrl: './inbox-layout.html',
  styleUrl: './inbox-layout.css',
})
export class InboxLayout {
  readonly hasDetail = input<boolean>(false)
}
