import { Component } from '@angular/core'
import { LucideLanguages } from '@lucide/angular'
import { LanguageSelect } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { SettingsHeader } from '../../settings-header/settings-header'

@Component({
  selector: 'app-preferences',
  imports: [LanguageSelect, TranslatePipe, SettingsHeader],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  readonly headerIcon = LucideLanguages
}
