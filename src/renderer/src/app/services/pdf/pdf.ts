import { Injectable, inject } from '@angular/core'
import type { PdfLabels } from '@shared/dtos/pdf'
import { I18nService } from '@app/services/i18n/i18n'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class PdfService {
  private readonly i18n = inject(I18nService)

  async exportInvoice(id: number): Promise<string | null> {
    return unwrap(await window.api.pdf.exportInvoice({ id, locale: this.i18n.locale(), labels: this.labels('invoice') }))
  }

  async exportQuote(id: number): Promise<string | null> {
    return unwrap(await window.api.pdf.exportQuote({ id, locale: this.i18n.locale(), labels: this.labels('quote') }))
  }

  private labels(kind: 'invoice' | 'quote'): PdfLabels {
    const t = (key: string): string => this.i18n.t(key)
    return {
      title:                kind === 'invoice' ? t('pdf.invoiceTitle') : t('pdf.quoteTitle'),
      number:               t('pdf.number'),
      issueDate:            t('pdf.issueDate'),
      supplyDate:           t('pdf.supplyDate'),
      dueDate:              t('pdf.dueDate'),
      validUntil:           t('pdf.validUntil'),
      quoteRef:             t('pdf.quoteRef'),
      billedTo:             t('pdf.billedTo'),
      colDescription:       t('pdf.colDescription'),
      colQty:               t('pdf.colQty'),
      colUnitPrice:         t('pdf.colUnitPrice'),
      colDiscount:          t('pdf.colDiscount'),
      colVat:               t('pdf.colVat'),
      colLineTotal:         t('pdf.colLineTotal'),
      totalHt:              t('pdf.totalHt'),
      vat:                  t('pdf.vat'),
      totalVat:             t('pdf.totalVat'),
      totalTtc:             t('pdf.totalTtc'),
      paid:                 t('pdf.paid'),
      balanceDue:           t('pdf.balanceDue'),
      companyNumber:        t('pdf.companyNumber'),
      vatNumber:            t('pdf.vatNumber'),
      iban:                 t('pdf.iban'),
      bic:                  t('pdf.bic'),
      paymentConditions:    t('pdf.paymentConditions'),
      mentionFranchise:     t('pdf.mentionFranchise'),
      mentionReverseCharge: t('pdf.mentionReverseCharge'),
    }
  }
}
