import { CompanyService } from '../company'
import { ProjectService } from '../project'
import { InvoiceService } from '../invoice'
import { QuoteService } from '../quote'
import { AppError } from '../../errors/app-error'
import {
  ConvertQuoteDto, ConvertQuoteResultDto,
  InvoiceBalanceDto, InvoiceBalanceResultDto,
  QuoteBillingDto,
} from '@shared/dtos/conversion'
import { ProjectStatus } from '@shared/dtos/project'
import { QuoteStatus, QuoteDto } from '@shared/dtos/quote'
import { InvoiceStatus, InvoiceLineInput } from '@shared/dtos/invoice'

const EPSILON = 0.005

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

interface RateAmount { rate: number; baseHt: number }

export class ConversionService {
  constructor(
    private readonly quotes:   QuoteService,
    private readonly projects: ProjectService,
    private readonly invoices: InvoiceService,
    private readonly company:  CompanyService,
  ) {}

  async convertQuote(data: ConvertQuoteDto): Promise<ConvertQuoteResultDto> {
    const quote = await this.requireQuote(data.quoteId)

    const projectId = quote.projectId ?? await this.createProject(data.projectName, quote.clientId)
    const updated   = await this.quotes.update({ id: quote.id, projectId, status: QuoteStatus.ACCEPTED })

    const invoiceId = data.createDepositInvoice && data.depositPercentage > 0
      ? await this.createDepositInvoice(quote, projectId, data.depositPercentage, data.depositLabel)
      : null

    return { quote: updated, projectId, invoiceId }
  }

  async invoiceBalance(data: InvoiceBalanceDto): Promise<InvoiceBalanceResultDto> {
    const quote     = await this.requireQuote(data.quoteId)
    const remaining = (await this.remainingByRate(quote)).filter(r => r.baseHt > EPSILON)
    if (remaining.length === 0) throw new AppError('NOTHING_TO_INVOICE')

    const invoiceId = await this.createInvoice(quote, this.toLines(remaining, data.label))
    return { quote, invoiceId }
  }

  async getQuoteBilling(quoteId: number): Promise<QuoteBillingDto> {
    const quote = await this.requireQuote(quoteId)
    const { invoicedHt, invoicedTtc } = await this.invoicedTotals(quote)
    const remainingHt  = round2(Math.max(0, quote.totalHt  - invoicedHt))
    const remainingTtc = round2(Math.max(0, quote.totalTtc - invoicedTtc))
    return {
      quoteId,
      totalHt:       quote.totalHt,
      totalTtc:      quote.totalTtc,
      invoicedHt,
      invoicedTtc,
      remainingHt,
      remainingTtc,
      fullyInvoiced: remainingTtc <= EPSILON,
    }
  }

  private async requireQuote(quoteId: number): Promise<QuoteDto> {
    const quote = await this.quotes.getById(quoteId)
    if (!quote) throw new AppError('NOT_FOUND')
    return quote
  }

  private async createProject(name: string, clientId: number): Promise<number> {
    const project = await this.projects.add({ name, clientId, status: ProjectStatus.IN_PROGRESS })
    return project.id
  }

  private async createDepositInvoice(
    quote: QuoteDto, projectId: number, percentage: number, label: string,
  ): Promise<number | null> {
    const deposit = quote.vatBreakdown
      .map(b => ({ rate: b.rate, baseHt: round2((b.baseHt * percentage) / 100) }))
      .filter(r => r.baseHt > EPSILON)
    if (deposit.length === 0) return null
    return this.createInvoice(quote, this.toLines(deposit, label), projectId)
  }

  private async createInvoice(
    quote: QuoteDto, lines: InvoiceLineInput[], projectId?: number,
  ): Promise<number> {
    const invoice = await this.invoices.add({
      clientId:  quote.clientId,
      projectId: projectId ?? quote.projectId,
      quoteId:   quote.id,
      dueDate:   await this.computeDueDate(),
      status:    InvoiceStatus.DRAFT,
      notes:     null,
      lines,
    })
    return invoice.id
  }

  private toLines(amounts: RateAmount[], label: string): InvoiceLineInput[] {
    const multiRate = amounts.length > 1
    return amounts.map(a => ({
      description: multiRate ? `${label} (${a.rate}%)` : label,
      quantity:    1,
      unitPrice:   a.baseHt,
      vatRate:     a.rate,
      productId:   null,
    }))
  }

  private async remainingByRate(quote: QuoteDto): Promise<RateAmount[]> {
    const invoiced = await this.invoices.sumInvoicedByRate(quote.id)
    return quote.vatBreakdown.map(b => ({
      rate:   b.rate,
      baseHt: round2(Math.max(0, b.baseHt - (invoiced.get(b.rate) ?? 0))),
    }))
  }

  private async invoicedTotals(quote: QuoteDto): Promise<{ invoicedHt: number; invoicedTtc: number }> {
    const invoiced = await this.invoices.sumInvoicedByRate(quote.id)
    let ht = 0
    let ttc = 0
    for (const [rate, baseHt] of invoiced) {
      ht  += baseHt
      ttc += baseHt * (1 + rate / 100)
    }
    return { invoicedHt: round2(ht), invoicedTtc: round2(ttc) }
  }

  private async computeDueDate(): Promise<Date> {
    const company = await this.company.getCompany()
    const days    = company?.settings.paymentTermsDays ?? 30
    const due     = new Date()
    due.setHours(0, 0, 0, 0)
    due.setDate(due.getDate() + days)
    return due
  }
}
