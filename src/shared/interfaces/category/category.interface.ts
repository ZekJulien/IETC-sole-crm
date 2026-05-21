import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../dtos/category'

export interface CategoryAPI {
  get:    (args?: FindManyArgs)     => Promise<IpcResponse<PaginatedResult<CategoryDto>>>
  add:    (data: CreateCategoryDto) => Promise<IpcResponse<CategoryDto>>
  update: (data: UpdateCategoryDto) => Promise<IpcResponse<CategoryDto>>
  remove: (id: number)              => Promise<IpcResponse<void>>
}
