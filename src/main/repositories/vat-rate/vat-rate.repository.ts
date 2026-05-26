import { VatRate } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class VatRateRepository extends BaseRepository<VatRate> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.vatRate,
      { orderBy: { rate: 'desc' } },
      ['label'],
    )
  }

  async clearDefault(): Promise<void> {
    await this.dbContext.client.vatRate.updateMany({ data: { isDefault: false } })
  }
}
