import { Quote, Prisma } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'
import { QuoteStatus, QuoteStatusCount } from '@shared/dtos/quote'

const quoteInclude = {
  client:  true,
  project: true,
  lines:   true,
} satisfies Prisma.QuoteInclude

export type QuoteWithRelations = Prisma.QuoteGetPayload<{ include: typeof quoteInclude }>

export interface QuoteLineData {
  description: string
  quantity:    number
  unitPrice:   number
  discount:    number
  vatRate:     number
  productId:   number | null
}

export class QuoteRepository extends BaseRepository<Quote> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.quote,
      { include: quoteInclude, orderBy: { issueDate: 'desc' } },
      ['number'],
    )
  }

  findByIdWithRelations(id: number): Promise<QuoteWithRelations | null> {
    return this.delegate.findUnique({ where: { id }, include: quoteInclude })
  }

  async countByStatus(): Promise<QuoteStatusCount> {
    const groups: { status: string; _count: { _all: number } }[] =
      await this.delegate.groupBy({ by: ['status'], _count: { _all: true } })
    return Object.fromEntries(groups.map(g => [g.status, g._count._all]))
  }

  updateStatus(id: number, status: QuoteStatus): Promise<Quote> {
    return this.delegate.update({ where: { id }, data: { status } })
  }

  async findLineIds(quoteId: number): Promise<number[]> {
    const lines = await this.dbContext.client.quoteLine.findMany({
      where:  { quoteId },
      select: { id: true },
    })
    return lines.map(l => l.id)
  }

  createLine(quoteId: number, data: QuoteLineData): Promise<unknown> {
    return this.dbContext.client.quoteLine.create({ data: { quoteId, ...data } })
  }

  updateLine(id: number, data: QuoteLineData): Promise<unknown> {
    return this.dbContext.client.quoteLine.update({ where: { id }, data })
  }

  deleteLine(id: number): Promise<unknown> {
    return this.dbContext.client.quoteLine.delete({ where: { id } })
  }
}
