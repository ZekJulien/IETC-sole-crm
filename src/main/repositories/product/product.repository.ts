import { Product } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class ProductRepository extends BaseRepository<Product> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.product,
      { orderBy: { name: 'asc' } },
      ['name'],
    )
  }
}
