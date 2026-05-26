import { Component, inject } from '@angular/core'
import { I18nService } from '@app/services/i18n/i18n'

interface Language {
  code: string
  name: string
}

const LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'de', name: 'Deutsch' },
]

@Component({
  selector: 'app-language-select',
  templateUrl: './language-select.html',
  styleUrl: './language-select.css',
})
export class LanguageSelect {
  private readonly i18n = inject(I18nService)
  readonly languages = LANGUAGES
  readonly current = this.i18n.locale

  onChange(value: string): void {
    void this.i18n.setLocale(value)
  }
}
