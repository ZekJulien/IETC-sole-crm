import { app } from 'electron'
import { errorsEn } from './errors.en'
import { errorsFr } from './errors.fr'
import { errorsNl } from './errors.nl'
import { errorsDe } from './errors.de'

const translations: Record<string, Record<string, string>> = {
  fr: errorsFr,
  en: errorsEn,
  nl: errorsNl,
  de: errorsDe,
}

let _locale: string = 'en'

export function initLocale(): void {
  const osLocale = app.getLocale().split('-')[0]
  _locale = osLocale in translations ? osLocale : 'en'
}

export function setLocale(locale: string): void {
  _locale = locale in translations ? locale : 'en'
}

export function t(code: string, params?: Record<string, string | number>): string {
  let msg = translations[_locale]?.[code] ?? translations['en'][code] ?? code
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      msg = msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }
  }
  return msg
}
