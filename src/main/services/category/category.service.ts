import { Category } from '@db/client'
import { CategoryRepository } from '../../repositories/category/category.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@shared/dtos/category'
import { AppError } from '../../errors/app-error'

export class CategoryService extends BaseService<Category, CategoryDto> {
  constructor(private readonly repo: CategoryRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<CategoryDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async add(data: CreateCategoryDto): Promise<CategoryDto> {
    if (await this.repo.isExist('name', data.name))
      throw new AppError('CATEGORY_NAME_TAKEN')
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateCategoryDto): Promise<CategoryDto> {
    return this.toDto(await this.repo.update(data))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(category: Category): CategoryDto {
    return { ...category }
  }
}
