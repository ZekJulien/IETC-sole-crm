import { CategoryService } from '../../services/category/category.service'
import { getCategoryRepository } from './category.repository.dependency'

let _instance: CategoryService | null = null

export function getCategoryService(): CategoryService {
  if (!_instance) _instance = new CategoryService(getCategoryRepository())
  return _instance
}
