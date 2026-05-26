import { Injectable, signal } from '@angular/core'
import validationEn from '../../i18n/validation/en'
import validationFr from '../../i18n/validation/fr'
import commonEn    from '../../i18n/ui/common.en'
import commonFr    from '../../i18n/ui/common.fr'
import clientEn    from '../../i18n/ui/client/client.en'
import clientFr    from '../../i18n/ui/client/client.fr'
import contactEn   from '../../i18n/ui/client/contact.en'
import contactFr   from '../../i18n/ui/client/contact.fr'
import companyEn   from '../../i18n/ui/company/company.en'
import companyFr   from '../../i18n/ui/company/company.fr'
import categoryEn  from '../../i18n/ui/category/category.en'
import categoryFr  from '../../i18n/ui/category/category.fr'
import expenseCategoryEn from '../../i18n/ui/expense-category/expense-category.en'
import expenseCategoryFr from '../../i18n/ui/expense-category/expense-category.fr'
import projectEn   from '../../i18n/ui/project/project.en'
import projectFr   from '../../i18n/ui/project/project.fr'
import taskEn      from '../../i18n/ui/task/task.en'
import taskFr      from '../../i18n/ui/task/task.fr'
import timeEn      from '../../i18n/ui/time-entry/time.en'
import timeFr      from '../../i18n/ui/time-entry/time.fr'
import expenseEn   from '../../i18n/ui/expense/expense.en'
import expenseFr   from '../../i18n/ui/expense/expense.fr'
import quoteEn     from '../../i18n/ui/quote/quote.en'
import quoteFr     from '../../i18n/ui/quote/quote.fr'
import invoiceEn   from '../../i18n/ui/invoice/invoice.en'
import invoiceFr   from '../../i18n/ui/invoice/invoice.fr'
import vatRateEn   from '../../i18n/ui/vat-rate/vat-rate.en'
import vatRateFr   from '../../i18n/ui/vat-rate/vat-rate.fr'
import productEn   from '../../i18n/ui/product/product.en'
import productFr   from '../../i18n/ui/product/product.fr'
import settingsEn  from '../../i18n/ui/settings/settings.en'
import settingsFr  from '../../i18n/ui/settings/settings.fr'

const translations: Record<string, Record<string, string>> = {
  en: { ...validationEn, ...commonEn, ...clientEn, ...contactEn, ...companyEn, ...categoryEn, ...expenseCategoryEn, ...projectEn, ...taskEn, ...timeEn, ...expenseEn, ...quoteEn, ...invoiceEn, ...vatRateEn, ...productEn, ...settingsEn },
  fr: { ...validationFr, ...commonFr, ...clientFr, ...contactFr, ...companyFr, ...categoryFr, ...expenseCategoryFr, ...projectFr, ...taskFr, ...timeFr, ...expenseFr, ...quoteFr, ...invoiceFr, ...vatRateFr, ...productFr, ...settingsFr },
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _locale = signal<string>(
    navigator.language.split('-')[0] in translations
      ? navigator.language.split('-')[0]
      : 'en'
  )

  readonly locale = this._locale.asReadonly()

  setLocale(locale: string): void {
    if (locale in translations) this._locale.set(locale)
  }

  t(key: string, params?: Record<string, string | number>): string {
    let msg = translations[this._locale()]?.[key]
      ?? translations['en']?.[key]
      ?? key
    if (params) {
      for (const [k, v] of Object.entries(params))
        msg = msg.replace(`{${k}}`, String(v))
    }
    return msg
  }
}
