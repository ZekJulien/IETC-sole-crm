import { getDbContext } from '../../core'
import { CategoryRepository } from '../../repositories/category/category.repository'

let _instance: CategoryRepository | null = null

export function getCategoryRepository(): CategoryRepository {
  if (!_instance) _instance = new CategoryRepository(getDbContext())
  return _instance
}
