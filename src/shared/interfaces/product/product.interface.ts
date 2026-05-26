import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { ProductDto, CreateProductDto, UpdateProductDto } from '../../dtos/product'

export interface ProductAPI {
  get:    (args?: FindManyArgs)    => Promise<IpcResponse<PaginatedResult<ProductDto>>>
  add:    (data: CreateProductDto) => Promise<IpcResponse<ProductDto>>
  update: (data: UpdateProductDto) => Promise<IpcResponse<ProductDto>>
  remove: (id: number)             => Promise<IpcResponse<void>>
}
