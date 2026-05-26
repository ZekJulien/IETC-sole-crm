import { Product } from '@db/client'
import { ProductRepository } from '../../repositories/product/product.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { ProductDto, CreateProductDto, UpdateProductDto } from '@shared/dtos/product'

export class ProductService extends BaseService<Product, ProductDto> {
  constructor(private readonly repo: ProductRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<ProductDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async add(data: CreateProductDto): Promise<ProductDto> {
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateProductDto): Promise<ProductDto> {
    return this.toDto(await this.repo.update(data))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(product: Product): ProductDto {
    return { ...product }
  }
}
