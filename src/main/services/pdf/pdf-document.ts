import type { Content, CustomTableLayout, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces'
import { PdfLabels } from '@shared/dtos/pdf'

export interface PdfParty {
  name:          string
  addressLines:  string[]
  vatNumber:     string | null
  companyNumber: string | null
}

export interface PdfCompanyParty extends PdfParty {
  legalForm:    string | null
  contactLines: string[]
  iban:         string | null
  bic:          string | null
  logoDataUrl:  string | null
}

export interface PdfLineModel {
  description: string
  quantity:    number
  unitPrice:   number
  discount:    number
  vatRate:     number
  lineHt:      number
}

export interface PdfVatRow {
  rate:   number
  baseHt: number
  vat:    number
}

export interface PdfModel {
  kind:              'invoice' | 'quote'
  number:            string
  issueDate:         Date
  supplyDate:        Date | null
  secondDate:        Date
  quoteRef:          string | null
  company:           PdfCompanyParty
  client:            PdfParty
  lines:             PdfLineModel[]
  vatBreakdown:      PdfVatRow[]
  totalHt:           number
  totalVat:          number
  totalTtc:          number
  paidAmount:        number | null
  balanceDue:        number | null
  paymentConditions: string | null
  legalMention:      string | null
  applyVat:          boolean
  locale:            string
  labels:            PdfLabels
}

const ACCENT      = '#4c3f91'
const HEADER_FILL = '#ece9f5'
const CARD_FILL   = '#f4f4f8'
const LINE        = '#d0d0d8'
const MUTED       = '#6b6b80'

const linesLayout: CustomTableLayout = {
  hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.9 : 0.4),
  vLineWidth: () => 0,
  hLineColor: () => LINE,
  paddingTop:    () => 5,
  paddingBottom: () => 5,
  paddingLeft:   () => 6,
  paddingRight:  () => 6,
}

const cardLayout: CustomTableLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  fillColor:     () => CARD_FILL,
  paddingTop:    () => 8,
  paddingBottom: () => 8,
  paddingLeft:   () => 10,
  paddingRight:  () => 10,
}

export function buildDocument(model: PdfModel): TDocumentDefinitions {
  const { labels } = model
  const money = (value: number): string =>
    normalizeSpaces(new Intl.NumberFormat(model.locale, { style: 'currency', currency: 'EUR' }).format(value))
  const date = (value: Date): string =>
    normalizeSpaces(new Intl.DateTimeFormat(model.locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(value))

  const content: Content[] = [
    headerBand(model, date),
    { text: '', margin: [0, 6, 0, 0] },
    clientCard(model),
    linesTable(model, money),
    totalsBlock(model, money),
  ]

  const mention = legalMention(model)
  if (mention) content.push(mention)

  return {
    pageSize: 'A4',
    pageMargins: [40, 44, 40, 64],
    defaultStyle: { font: 'Helvetica', fontSize: 9.5, color: '#1e1e2e', lineHeight: 1.15 },
    info: {
      title:    `${labels.title} ${model.number}`,
      author:   model.company.name,
      creator:  'Sole',
      producer: 'Sole',
    },
    content,
    footer: () => footerBand(model),
  }
}

function headerBand(model: PdfModel, date: (d: Date) => string): Content {
  const c = model.company
  const identity: Content[] = []
  if (c.logoDataUrl) identity.push({ image: c.logoDataUrl, fit: [150, 60], margin: [0, 0, 0, 6] })
  identity.push({ text: c.name, fontSize: 15, bold: true, color: ACCENT })
  if (c.legalForm) identity.push({ text: c.legalForm, color: MUTED })
  for (const l of c.addressLines) identity.push({ text: l })
  for (const l of c.contactLines) identity.push({ text: l, color: MUTED, fontSize: 8.5 })
  if (c.companyNumber) identity.push({ text: `${model.labels.companyNumber} : ${c.companyNumber}`, fontSize: 8.5 })
  if (c.vatNumber) identity.push({ text: `${model.labels.vatNumber} : ${c.vatNumber}`, fontSize: 8.5 })

  const meta: Content[] = [
    { text: model.labels.title.toUpperCase(), fontSize: 22, bold: true, color: ACCENT, alignment: 'right' },
    { text: model.number, fontSize: 12, bold: true, alignment: 'right', margin: [0, 0, 0, 8] },
    metaLine(model.labels.issueDate, date(model.issueDate)),
  ]
  if (model.kind === 'invoice' && model.supplyDate) meta.push(metaLine(model.labels.supplyDate, date(model.supplyDate)))
  meta.push(metaLine(model.kind === 'invoice' ? model.labels.dueDate : model.labels.validUntil, date(model.secondDate)))
  if (model.quoteRef) meta.push(metaLine(model.labels.quoteRef, model.quoteRef))

  return {
    columns: [
      { width: '*', stack: identity },
      { width: 'auto', stack: meta },
    ],
    columnGap: 24,
  }
}

function metaLine(label: string, value: string): Content {
  return {
    columns: [
      { width: '*', text: label, color: MUTED, alignment: 'right', fontSize: 8.5 },
      { width: 'auto', text: value, alignment: 'right', bold: true, fontSize: 9.5, margin: [8, 0, 0, 0] },
    ],
  }
}

function clientCard(model: PdfModel): Content {
  const stack: Content[] = [
    { text: model.labels.billedTo, color: MUTED, fontSize: 8, bold: true, margin: [0, 0, 0, 3] },
    { text: model.client.name, bold: true },
  ]
  for (const l of model.client.addressLines) stack.push({ text: l })
  if (model.client.vatNumber) stack.push({ text: `${model.labels.vatNumber} : ${model.client.vatNumber}`, fontSize: 8.5, color: MUTED })

  return {
    unbreakable: true,
    columns: [
      { width: '*', text: '' },
      {
        width: 250,
        table: { widths: ['*'], body: [[{ stack }]] },
        layout: cardLayout,
      },
    ],
    margin: [0, 0, 0, 16],
  }
}

function linesTable(model: PdfModel, money: (n: number) => string): Content {
  const showDiscount = model.lines.some(l => l.discount > 0)

  const head: TableCell[] = [
    { text: model.labels.colDescription, style: 'th' },
    { text: model.labels.colQty, style: 'th', alignment: 'right' },
    { text: model.labels.colUnitPrice, style: 'th', alignment: 'right' },
    ...(showDiscount ? [{ text: model.labels.colDiscount, style: 'th', alignment: 'right' } as TableCell] : []),
    { text: model.labels.colVat, style: 'th', alignment: 'right' },
    { text: model.labels.colLineTotal, style: 'th', alignment: 'right' },
  ]
  const body: TableCell[][] = [head]
  for (const line of model.lines) {
    body.push([
      { text: line.description },
      { text: formatQty(line.quantity, model.locale), alignment: 'right' },
      { text: money(line.unitPrice), alignment: 'right' },
      ...(showDiscount ? [{ text: line.discount > 0 ? `${formatRate(line.discount)} %` : '—', alignment: 'right' } as TableCell] : []),
      { text: model.applyVat ? `${formatRate(line.vatRate)} %` : '—', alignment: 'right' },
      { text: money(line.lineHt), alignment: 'right' },
    ])
  }

  const widths = showDiscount ? ['*', 38, 64, 44, 38, 66] : ['*', 42, 70, 42, 72]
  return {
    table: { headerRows: 1, widths, body },
    layout: linesLayout,
    margin: [0, 0, 0, 12],
  }
}

function totalsBlock(model: PdfModel, money: (n: number) => string): Content {
  const rows: TableCell[][] = [totalRow(model.labels.totalHt, money(model.totalHt))]

  if (model.applyVat) {
    if (model.vatBreakdown.length > 1) {
      for (const b of model.vatBreakdown) rows.push(totalRow(`${model.labels.vat} ${formatRate(b.rate)} %`, money(b.vat)))
      rows.push(totalRow(model.labels.totalVat, money(model.totalVat)))
    } else if (model.vatBreakdown.length === 1) {
      rows.push(totalRow(`${model.labels.vat} ${formatRate(model.vatBreakdown[0].rate)} %`, money(model.vatBreakdown[0].vat)))
    }
  }

  rows.push(totalRow(model.labels.totalTtc, money(model.totalTtc), true))

  if (model.kind === 'invoice' && model.paidAmount !== null && model.balanceDue !== null) {
    if (model.paidAmount > 0) rows.push(totalRow(model.labels.paid, money(model.paidAmount)))
    rows.push(totalRow(model.labels.balanceDue, money(model.balanceDue), true))
  }

  return {
    unbreakable: true,
    columns: [
      { width: '*', text: '' },
      { width: 240, table: { widths: ['*', 'auto'], body: rows }, layout: 'lightHorizontalLines' },
    ],
    margin: [0, 0, 0, 14],
  }
}

function totalRow(label: string, value: string, strong = false): TableCell[] {
  return [
    { text: label, alignment: 'left', bold: strong, color: strong ? ACCENT : '#1e1e2e', margin: [0, 1, 0, 1] },
    { text: value, alignment: 'right', bold: strong, color: strong ? ACCENT : '#1e1e2e', margin: [0, 1, 0, 1] },
  ]
}

function legalMention(model: PdfModel): Content | null {
  if (!model.legalMention) return null
  return {
    unbreakable: true,
    table: { widths: ['*'], body: [[{ text: model.legalMention, italics: true, fontSize: 8.5, color: '#1e1e2e' }]] },
    layout: cardLayout,
    margin: [0, 0, 0, 6],
  }
}

function footerBand(model: PdfModel): Content {
  const parts: string[] = []
  if (model.company.iban) parts.push(`${model.labels.iban} : ${model.company.iban}`)
  if (model.company.bic) parts.push(`${model.labels.bic} : ${model.company.bic}`)

  const stack: Content[] = []
  if (parts.length) stack.push({ text: parts.join('   ·   '), alignment: 'center', fontSize: 8.5, color: '#1e1e2e' })
  if (model.paymentConditions)
    stack.push({ text: `${model.labels.paymentConditions} : ${model.paymentConditions}`, alignment: 'center', fontSize: 8, color: MUTED })

  return { stack, margin: [40, 8, 40, 0] }
}

function formatRate(rate: number): string {
  return Number.isInteger(rate) ? String(rate) : String(rate).replace('.', ',')
}

function formatQty(qty: number, locale: string): string {
  return normalizeSpaces(new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(qty))
}

function normalizeSpaces(value: string): string {
  return value.replace(/[\u00a0\u202f\u2009\u2007\u2008]/g, ' ')
}
