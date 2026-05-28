import { QuoteRepository, QuoteWithRelations, QuoteLineData } from '../../repositories/quote/quote.repository'
import { CompanyService } from '../company'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import {
  QuoteDto, CreateQuoteDto, UpdateQuoteDto, UpdateQuoteStatusDto,
  QuoteStatus, QuoteStatusCount, QuoteLineInput,
} from '@shared/dtos/quote'
import { round2, lineNet, computeDocumentTotals } from '@shared/utils/document-totals'
import { formatClientName } from '@shared/utils/format-client-name'

function toLineData(line: QuoteLineInput): QuoteLineData {
  return {
    description: line.description,
    quantity:    line.quantity,
    unitPrice:   line.unitPrice,
    discount:    line.discount ?? 0,
    vatRate:     line.vatRate,
    productId:   line.productId ?? null,
  }
}

export class QuoteService extends BaseService<QuoteWithRelations, QuoteDto> {
  constructor(
    private readonly repo: QuoteRepository,
    private readonly company: CompanyService,
  ) {
    super()
  }

  async get(args?: FindManyArgs): Promise<PaginatedResult<QuoteDto>> {
    return this.mapMany(await this.repo.findMany(args) as PaginatedResult<QuoteWithRelations>)
  }

  async getById(id: number): Promise<QuoteDto | null> {
    return this.mapOne(await this.repo.findByIdWithRelations(id))
  }

  countByStatus(): Promise<QuoteStatusCount> {
    return this.repo.countByStatus()
  }

  async add(data: CreateQuoteDto): Promise<QuoteDto> {
    const { lines, projectId, ...rest } = data
    const number = await this.company.getNextQuoteNumber()
    const created = await this.repo.create({ ...rest, number, projectId: projectId ?? null })
    for (const line of lines) await this.repo.createLine(created.id, toLineData(line))
    return this.toDto((await this.repo.findByIdWithRelations(created.id))!)
  }

  async update(data: UpdateQuoteDto): Promise<QuoteDto> {
    const { id, lines, ...rest } = data
    await this.repo.update({ id, ...rest })
    if (lines) await this.syncLines(id, lines)
    return this.toDto((await this.repo.findByIdWithRelations(id))!)
  }

  async updateStatus(data: UpdateQuoteStatusDto): Promise<QuoteDto> {
    await this.repo.updateStatus(data.id, data.status)
    return this.toDto((await this.repo.findByIdWithRelations(data.id))!)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  private async syncLines(quoteId: number, lines: QuoteLineInput[]): Promise<void> {
    const existing    = await this.repo.findLineIds(quoteId)
    const incomingIds = lines.filter(l => l.id != null).map(l => l.id!)
    for (const id of existing.filter(id => !incomingIds.includes(id)))
      await this.repo.deleteLine(id)
    for (const line of lines) {
      if (line.id != null) await this.repo.updateLine(line.id, toLineData(line))
      else                 await this.repo.createLine(quoteId, toLineData(line))
    }
  }

  protected toDto(q: QuoteWithRelations): QuoteDto {
    const lines = q.lines.map(l => ({
      id:          l.id,
      description: l.description,
      quantity:    l.quantity,
      unitPrice:   l.unitPrice,
      discount:    l.discount,
      vatRate:     l.vatRate,
      productId:   l.productId,
      total:       round2(lineNet(l)),
    }))

    const { totalHt, totalVat, totalTtc, vatBreakdown } = computeDocumentTotals(q.lines)

    return {
      id:           q.id,
      number:       q.number,
      issueDate:    q.issueDate,
      validUntil:   q.validUntil,
      status:       q.status as QuoteStatus,
      notes:        q.notes,
      clientId:     q.clientId,
      clientName:   formatClientName(q.client),
      projectId:    q.projectId,
      projectName:  q.project?.name ?? null,
      lines,
      vatBreakdown,
      totalHt,
      totalVat,
      totalTtc,
      createdAt:    q.createdAt,
      updatedAt:    q.updatedAt,
    }
  }
}
