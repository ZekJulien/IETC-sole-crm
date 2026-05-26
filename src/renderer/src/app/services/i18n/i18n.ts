import { Injectable, signal } from '@angular/core'

type Dictionary = Record<string, string>

const STORAGE_KEY = 'sole.locale'

const loaders: Record<string, () => Promise<{ default: Dictionary }>> = {
  en: () => import('../../i18n/locales/en'),
  fr: () => import('../../i18n/locales/fr'),
  nl: () => import('../../i18n/locales/nl'),
  de: () => import('../../i18n/locales/de'),
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _locale = signal<string>(this.initialLocale())
  private readonly _dictionary = signal<Dictionary>({})
  readonly locale = this._locale.asReadonly()
  readonly available = Object.keys(loaders)

  async init(): Promise<void> {
    await this.loadDictionary(this._locale())
    void window.api?.i18n?.setLocale(this._locale())
  }

  async setLocale(locale: string): Promise<void> {
    if (!(locale in loaders)) return
    await this.loadDictionary(locale)
    this._locale.set(locale)
    localStorage.setItem(STORAGE_KEY, locale)
    void window.api?.i18n?.setLocale(locale)
  }

  t(key: string, params?: Record<string, string | number>): string {
    let msg = this._dictionary()[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params))
        msg = msg.replace(`{${k}}`, String(v))
    }
    return msg
  }

  private async loadDictionary(locale: string): Promise<void> {
    if (locale === 'en') {
      this._dictionary.set((await loaders['en']()).default)
      return
    }
    const [base, active] = await Promise.all([loaders['en'](), loaders[locale]()])
    this._dictionary.set({ ...base.default, ...active.default })
  }

  private initialLocale(): string {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in loaders) return saved
    const nav = navigator.language.split('-')[0]
    return nav in loaders ? nav : 'en'
  }
}
