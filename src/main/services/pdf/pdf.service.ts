import { promises as fs } from 'node:fs'
import path from 'node:path'
import { InvoiceService } from '../invoice'
import { QuoteService } from '../quote'
import { CompanyService } from '../company'
import { ClientService } from '../client'
import { AppError } from '../../errors/app-error'
import { ExportPdfDto } from '@shared/dtos/pdf'
import { CompanyDto } from '@shared/dtos/company'
import { ClientDto } from '@shared/dtos/client'
import { resolveVatTreatment, VatTreatment } from '@shared/utils/vat-treatment'
import { renderToBuffer } from './pdf-printer'
import { buildDocument, PdfCompanyParty, PdfLineModel, PdfModel, PdfParty } from './pdf-document'

export interface PdfResult {
  buffer:   Buffer
  filename: string
}

interface LineLike {
  description: string
  quantity:    number
  unitPrice:   number
  discount:    number
  vatRate:     number
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export class PdfService {
  constructor(
    private readonly invoices: InvoiceService,
    private readonly quotes:   QuoteService,
    private readonly company:  CompanyService,
    private readonly clients:  ClientService,
  ) {}

  async invoicePdf(input: ExportPdfDto): Promise<PdfResult> {
    const invoice = await this.invoices.getById(input.id)
    if (!invoice) throw new AppError('NOT_FOUND')

    const { company, client } = await this.context(invoice.clientId)
    const treatment = this.treatment(company, client)
    const applyVat  = treatment === 'NORMAL'

    const model: PdfModel = {
      kind:              'invoice',
      number:            invoice.number,
      issueDate:         new Date(invoice.issueDate),
      supplyDate:        invoice.supplyDate ? new Date(invoice.supplyDate) : null,
      secondDate:        new Date(invoice.dueDate),
      quoteRef:          invoice.quoteNumber,
      company:           await this.companyParty(company),
      client:            this.clientParty(client),
      lines:             invoice.lines.map(toLine),
      vatBreakdown:      applyVat ? invoice.vatBreakdown : [],
      totalHt:           invoice.totalHt,
      totalVat:          applyVat ? invoice.totalVat : 0,
      totalTtc:          applyVat ? invoice.totalTtc : invoice.totalHt,
      paidAmount:        invoice.paidAmount,
      balanceDue:        applyVat ? invoice.balanceDue : round2(invoice.totalHt - invoice.paidAmount),
      paymentConditions: company.settings.paymentConditions,
      legalMention:      mentionFor(treatment, input),
      applyVat,
      locale:            input.locale,
      labels:            input.labels,
    }

    return { buffer: await renderToBuffer(buildDocument(model)), filename: toFilename(invoice.number) }
  }

  async quotePdf(input: ExportPdfDto): Promise<PdfResult> {
    const quote = await this.quotes.getById(input.id)
    if (!quote) throw new AppError('NOT_FOUND')

    const { company, client } = await this.context(quote.clientId)
    const treatment = this.treatment(company, client)
    const applyVat  = treatment === 'NORMAL'

    const model: PdfModel = {
      kind:              'quote',
      number:            quote.number,
      issueDate:         new Date(quote.issueDate),
      supplyDate:        null,
      secondDate:        new Date(quote.validUntil),
      quoteRef:          null,
      company:           await this.companyParty(company),
      client:            this.clientParty(client),
      lines:             quote.lines.map(toLine),
      vatBreakdown:      applyVat ? quote.vatBreakdown : [],
      totalHt:           quote.totalHt,
      totalVat:          applyVat ? quote.totalVat : 0,
      totalTtc:          applyVat ? quote.totalTtc : quote.totalHt,
      paidAmount:        null,
      balanceDue:        null,
      paymentConditions: company.settings.paymentConditions,
      legalMention:      mentionFor(treatment, input),
      applyVat,
      locale:            input.locale,
      labels:            input.labels,
    }

    return { buffer: await renderToBuffer(buildDocument(model)), filename: toFilename(quote.number) }
  }

  private async context(clientId: number): Promise<{ company: CompanyDto; client: ClientDto }> {
    const company = await this.company.getCompany()
    if (!company) throw new AppError('COMPANY_NOT_CONFIGURED')
    const client = await this.clients.getByIdWithRelation(clientId)
    if (!client) throw new AppError('NOT_FOUND')
    return { company, client }
  }

  private treatment(company: CompanyDto, client: ClientDto): VatTreatment {
    return resolveVatTreatment({
      companyRegime:   company.settings.vatRegime,
      clientCountry:   client.country,
      clientVatNumber: client.vatNumber,
    })
  }

  private async companyParty(c: CompanyDto): Promise<PdfCompanyParty> {
    return {
      name:          c.name,
      legalForm:     c.legalForm,
      addressLines:  addressLines(c.street, c.zipCode, c.city, c.country),
      contactLines:  [c.email, c.phone, c.website].filter((v): v is string => !!v),
      vatNumber:     c.vatNumber,
      companyNumber: c.companyNumber,
      iban:          c.iban,
      bic:           c.bic,
      logoDataUrl:   await readLogo(c.logoPath),
    }
  }

  private clientParty(client: ClientDto): PdfParty {
    return {
      name:          [client.firstName, client.name].filter(Boolean).join(' ') || client.name,
      addressLines:  addressLines(client.street, client.zipCode, client.city, client.country),
      vatNumber:     client.vatNumber,
      companyNumber: client.companyNumber,
    }
  }
}

function toLine(line: LineLike): PdfLineModel {
  return {
    description: line.description,
    quantity:    line.quantity,
    unitPrice:   line.unitPrice,
    discount:    line.discount,
    vatRate:     line.vatRate,
    lineHt:      round2(line.quantity * line.unitPrice * (1 - (line.discount ?? 0) / 100)),
  }
}

function mentionFor(treatment: VatTreatment, input: ExportPdfDto): string | null {
  if (treatment === 'FRANCHISE')      return input.labels.mentionFranchise
  if (treatment === 'REVERSE_CHARGE') return input.labels.mentionReverseCharge
  return null
}

function addressLines(street: string | null, zip: string | null, city: string | null, country: string | null): string[] {
  const lines: string[] = []
  if (street) lines.push(street)
  const cityLine = [zip, city].filter(Boolean).join(' ')
  if (cityLine) lines.push(cityLine)
  if (country) lines.push(country)
  return lines
}

async function readLogo(logoPath: string | null): Promise<string | null> {
  if (!logoPath) return null
  try {
    const ext  = path.extname(logoPath).toLowerCase()
    const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : null
    if (!mime) return null
    const buffer = await fs.readFile(logoPath)
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

function toFilename(documentNumber: string): string {
  return `${documentNumber.replace(/[^\w.-]+/g, '-')}.pdf`
}
