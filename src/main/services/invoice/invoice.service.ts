import {
  InvoiceRepository, InvoiceWithRelations, InvoiceLineData, PaymentData,
} from '../../repositories/invoice/invoice.repository'
import { CompanyService } from '../company'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import {
  InvoiceDto, CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, RecordPaymentDto,
  InvoiceStatus, InvoiceStatusCount, InvoiceStats, InvoiceLineInput, InvoiceVatBreakdownLine,
} from '@shared/dtos/invoice'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function toLineData(line: InvoiceLineInput): InvoiceLineData {
  return {
    description: line.description,
    quantity:    line.quantity,
    unitPrice:   line.unitPrice,
    vatRate:     line.vatRate,
    productId:   line.productId ?? null,
  }
}

interface LineLike { quantity: number; unitPrice: number; vatRate: number }

function computeTotals(lines: LineLike[]): {
  totalHt: number; totalVat: number; totalTtc: number; vatBreakdown: InvoiceVatBreakdownLine[]
} {
  const byRate = new Map<number, number>()
  let totalHt = 0
  for (const l of lines) {
    const ht = l.quantity * l.unitPrice
    totalHt += ht
    byRate.set(l.vatRate, (byRate.get(l.vatRate) ?? 0) + ht)
  }
  const vatBreakdown = [...byRate.entries()]
    .map(([rate, baseHt]) => ({ rate, baseHt: round2(baseHt), vat: round2((baseHt * rate) / 100) }))
    .sort((a, b) => b.rate - a.rate)
  const totalVat = round2(vatBreakdown.reduce((sum, b) => sum + b.vat, 0))
  return { totalHt: round2(totalHt), totalVat, totalTtc: round2(round2(totalHt) + totalVat), vatBreakdown }
}

function sumPayments(payments: { amount: number }[]): number {
  return round2(payments.reduce((sum, p) => sum + p.amount, 0))
}

export class InvoiceService extends BaseService<InvoiceWithRelations, InvoiceDto> {
  constructor(
    private readonly repo: InvoiceRepository,
    private readonly company: CompanyService,
  ) {
    super()
  }

  async get(args?: FindManyArgs): Promise<PaginatedResult<InvoiceDto>> {
    const result = await this.repo.findMany(args) as PaginatedResult<InvoiceWithRelations>
    const data: InvoiceDto[] = []
    for (const inv of result.data) data.push(this.toDto(await this.refreshStatus(inv)))
    return { ...result, data }
  }

  async getById(id: number): Promise<InvoiceDto | null> {
    const invoice = await this.repo.findByIdWithRelations(id)
    if (!invoice) return null
    return this.toDto(await this.refreshStatus(invoice))
  }

  countByStatus(): Promise<InvoiceStatusCount> {
    return this.repo.countByStatus()
  }

  async getStats(): Promise<InvoiceStats> {
    const live = await this.repo.findByStatuses([InvoiceStatus.SENT, InvoiceStatus.OVERDUE])
    let unpaid = 0
    for (const inv of live) {
      const { totalTtc } = computeTotals(inv.lines)
      unpaid += Math.max(0, round2(totalTtc - sumPayments(inv.payments)))
    }
    const { start, end } = monthRange()
    const revenueThisMonth = await this.repo.sumPaymentsBetween(start, end)
    return { unpaid: round2(unpaid), revenueThisMonth: round2(revenueThisMonth) }
  }

  async add(data: CreateInvoiceDto): Promise<InvoiceDto> {
    const { lines, projectId, status, ...rest } = data
    const number = await this.company.getNextInvoiceNumber()
    const created = await this.repo.create({
      ...rest,
      number,
      projectId: projectId ?? null,
      status:    status ?? InvoiceStatus.DRAFT,
    })
    for (const line of lines) await this.repo.createLine(created.id, toLineData(line))
    return this.getByIdOrThrow(created.id)
  }

  async update(data: UpdateInvoiceDto): Promise<InvoiceDto> {
    const { id, lines, ...rest } = data
    await this.repo.update({ id, ...rest })
    if (lines) await this.syncLines(id, lines)
    return this.getByIdOrThrow(id)
  }

  async updateStatus(data: UpdateInvoiceStatusDto): Promise<InvoiceDto> {
    await this.repo.updateStatus(data.id, data.status)
    return this.getByIdOrThrow(data.id)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  async addPayment(data: RecordPaymentDto): Promise<InvoiceDto> {
    const payment: PaymentData = {
      date:      data.date ?? new Date(),
      amount:    data.amount,
      method:    data.method,
      reference: data.reference ?? null,
    }
    await this.repo.createPayment(data.invoiceId, payment)
    return this.getByIdOrThrow(data.invoiceId)
  }

  async removePayment(paymentId: number): Promise<InvoiceDto> {
    const invoiceId = await this.repo.findPaymentInvoiceId(paymentId)
    await this.repo.deletePayment(paymentId)
    return this.getByIdOrThrow(invoiceId!)
  }

  private async getByIdOrThrow(id: number): Promise<InvoiceDto> {
    return this.toDto(await this.refreshStatus((await this.repo.findByIdWithRelations(id))!))
  }

  private async syncLines(invoiceId: number, lines: InvoiceLineInput[]): Promise<void> {
    const existing    = await this.repo.findLineIds(invoiceId)
    const incomingIds = lines.filter(l => l.id != null).map(l => l.id!)
    for (const id of existing.filter(id => !incomingIds.includes(id)))
      await this.repo.deleteLine(id)
    for (const line of lines) {
      if (line.id != null) await this.repo.updateLine(line.id, toLineData(line))
      else                 await this.repo.createLine(invoiceId, toLineData(line))
    }
  }

  private async refreshStatus(inv: InvoiceWithRelations): Promise<InvoiceWithRelations> {
    const desired = this.desiredStatus(inv)
    if (desired !== inv.status) {
      await this.repo.updateStatus(inv.id, desired)
      inv.status = desired
    }
    return inv
  }

  private desiredStatus(inv: InvoiceWithRelations): InvoiceStatus {
    const current = inv.status as InvoiceStatus
    if (current === InvoiceStatus.DRAFT || current === InvoiceStatus.CANCELLED) return current

    const { totalTtc } = computeTotals(inv.lines)
    const paid = sumPayments(inv.payments)
    if (totalTtc > 0 && paid >= totalTtc) return InvoiceStatus.PAID

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    if (new Date(inv.dueDate) < startOfToday) return InvoiceStatus.OVERDUE

    return InvoiceStatus.SENT
  }

  protected toDto(inv: InvoiceWithRelations): InvoiceDto {
    const lines = inv.lines.map(l => ({
      id:          l.id,
      description: l.description,
      quantity:    l.quantity,
      unitPrice:   l.unitPrice,
      vatRate:     l.vatRate,
      productId:   l.productId,
      total:       round2(l.quantity * l.unitPrice),
    }))

    const { totalHt, totalVat, totalTtc, vatBreakdown } = computeTotals(inv.lines)
    const paidAmount = sumPayments(inv.payments)

    return {
      id:           inv.id,
      number:       inv.number,
      issueDate:    inv.issueDate,
      dueDate:      inv.dueDate,
      status:       inv.status as InvoiceStatus,
      notes:        inv.notes,
      clientId:     inv.clientId,
      clientName:   [inv.client.firstName, inv.client.name].filter(Boolean).join(' '),
      projectId:    inv.projectId,
      projectName:  inv.project?.name ?? null,
      lines,
      payments:     inv.payments.map(p => ({
        id:        p.id,
        date:      p.date,
        amount:    p.amount,
        method:    p.method as InvoiceDto['payments'][number]['method'],
        reference: p.reference,
      })),
      vatBreakdown,
      totalHt,
      totalVat,
      totalTtc,
      paidAmount,
      balanceDue:   round2(totalTtc - paidAmount),
      createdAt:    inv.createdAt,
      updatedAt:    inv.updatedAt,
    }
  }
}

function monthRange(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end:   new Date(now.getFullYear(), now.getMonth() + 1, 1),
  }
}
