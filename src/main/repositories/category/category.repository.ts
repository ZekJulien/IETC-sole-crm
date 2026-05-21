import { Category } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class CategoryRepository extends BaseRepository<Category> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.category,
      { orderBy: { name: 'asc' } },
      ['name'],
    )
  }
}
