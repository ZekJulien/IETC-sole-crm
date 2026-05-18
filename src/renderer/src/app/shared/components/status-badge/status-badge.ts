import { Component, computed, input } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'

@Component({
  selector: 'app-status-badge',
  imports: [TranslatePipe],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly status  = input.required<string>()
  readonly i18nKey = input<string | null>(null)

  readonly label = computed(() => this.i18nKey() ?? this.status())
}
