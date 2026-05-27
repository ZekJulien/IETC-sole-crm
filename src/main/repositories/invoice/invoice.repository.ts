import { Invoice, Prisma } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'
import { InvoiceStatus, InvoiceStatusCount, PaymentMethod } from '@shared/dtos/invoice'

const invoiceInclude = {
  client:   true,
  project:  true,
  quote:    true,
  lines:    true,
  payments: { orderBy: { date: 'asc' } },
} satisfies Prisma.InvoiceInclude

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>

export interface InvoiceLineData {
  description: string
  quantity:    number
  unitPrice:   number
  vatRate:     number
  productId:   number | null
}

export interface PaymentData {
  date:      Date
  amount:    number
  method:    PaymentMethod
  reference: string | null
}

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.invoice,
      { include: invoiceInclude, orderBy: { issueDate: 'desc' } },
      ['number'],
    )
  }

  findByIdWithRelations(id: number): Promise<InvoiceWithRelations | null> {
    return this.delegate.findUnique({ where: { id }, include: invoiceInclude })
  }

  findByStatuses(statuses: InvoiceStatus[]): Promise<InvoiceWithRelations[]> {
    return this.delegate.findMany({ where: { status: { in: statuses } }, include: invoiceInclude })
  }

  async countByStatus(): Promise<InvoiceStatusCount> {
    const groups: { status: string; _count: { _all: number } }[] =
      await this.delegate.groupBy({ by: ['status'], _count: { _all: true } })
    return Object.fromEntries(groups.map(g => [g.status, g._count._all]))
  }

  async sumPaymentsBetween(start: Date, end: Date): Promise<number> {
    const res: { _sum: { amount: number | null } } = await this.dbContext.client.payment.aggregate({
      _sum:  { amount: true },
      where: { date: { gte: start, lt: end } },
    })
    return res._sum.amount ?? 0
  }

  updateStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
    return this.delegate.update({ where: { id }, data: { status } })
  }

  findLinesByQuote(quoteId: number): Promise<{ quantity: number; unitPrice: number; vatRate: number }[]> {
    return this.dbContext.client.invoiceLine.findMany({
      where:  { invoice: { quoteId, status: { not: InvoiceStatus.CANCELLED } } },
      select: { quantity: true, unitPrice: true, vatRate: true },
    })
  }

  async findLineIds(invoiceId: number): Promise<number[]> {
    const lines = await this.dbContext.client.invoiceLine.findMany({
      where:  { invoiceId },
      select: { id: true },
    })
    return lines.map(l => l.id)
  }

  createLine(invoiceId: number, data: InvoiceLineData): Promise<unknown> {
    return this.dbContext.client.invoiceLine.create({ data: { invoiceId, ...data } })
  }

  updateLine(id: number, data: InvoiceLineData): Promise<unknown> {
    return this.dbContext.client.invoiceLine.update({ where: { id }, data })
  }

  deleteLine(id: number): Promise<unknown> {
    return this.dbContext.client.invoiceLine.delete({ where: { id } })
  }

  createPayment(invoiceId: number, data: PaymentData): Promise<unknown> {
    return this.dbContext.client.payment.create({ data: { invoiceId, ...data } })
  }

  async findPaymentInvoiceId(paymentId: number): Promise<number | null> {
    const payment = await this.dbContext.client.payment.findUnique({
      where:  { id: paymentId },
      select: { invoiceId: true },
    })
    return payment?.invoiceId ?? null
  }

  deletePayment(id: number): Promise<unknown> {
    return this.dbContext.client.payment.delete({ where: { id } })
  }
}
