import { ProductService } from '../../services/product/product.service'
import { getProductRepository } from './product.repository.dependency'

let _instance: ProductService | null = null

export function getProductService(): ProductService {
  if (!_instance) _instance = new ProductService(getProductRepository())
  return _instance
}
