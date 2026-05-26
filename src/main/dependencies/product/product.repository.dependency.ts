import { getDbContext } from '../../core'
import { ProductRepository } from '../../repositories/product/product.repository'

let _instance: ProductRepository | null = null

export function getProductRepository(): ProductRepository {
  if (!_instance) _instance = new ProductRepository(getDbContext())
  return _instance
}
