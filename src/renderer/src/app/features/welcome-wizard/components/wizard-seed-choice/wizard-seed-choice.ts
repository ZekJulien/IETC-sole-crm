import { Component, input, output } from '@angular/core'
import { LucideRocket, LucideFolderPlus } from '@lucide/angular'
import { Card } from '@app/components'
import { TranslatePipe } from '@app/pipes'

export type SeedChoice = 'demo' | 'empty'

@Component({
  selector: 'app-wizard-seed-choice',
  imports: [Card, LucideRocket, LucideFolderPlus, TranslatePipe],
  templateUrl: './wizard-seed-choice.html',
  styleUrl: './wizard-seed-choice.css',
})
export class WizardSeedChoice {
  readonly busy   = input<boolean>(false)
  readonly choose = output<SeedChoice>()

  pick(mode: SeedChoice): void {
    if (!this.busy()) this.choose.emit(mode)
  }
}
