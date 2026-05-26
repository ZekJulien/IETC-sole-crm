import { Component, output } from '@angular/core'
import { LucideSparkles } from '@lucide/angular'
import { Button, LanguageSelect } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'

@Component({
  selector: 'app-wizard-welcome',
  imports: [LucideSparkles, Button, LanguageSelect, TranslatePipe],
  templateUrl: './wizard-welcome.html',
  styleUrl: './wizard-welcome.css',
})
export class WizardWelcome {
  readonly start = output<void>()
  readonly ButtonVariant = ButtonVariant
}
