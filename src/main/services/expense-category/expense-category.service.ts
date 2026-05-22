import { ExpenseCategory } from '@db/client'
import { ExpenseCategoryRepository } from '../../repositories/expense-category/expense-category.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { ExpenseCategoryDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@shared/dtos/expense-category'
import { AppError } from '../../errors/app-error'

export class ExpenseCategoryService extends BaseService<ExpenseCategory, ExpenseCategoryDto> {
  constructor(private readonly repo: ExpenseCategoryRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<ExpenseCategoryDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async add(data: CreateExpenseCategoryDto): Promise<ExpenseCategoryDto> {
    if (await this.repo.isExist('name', data.name))
      throw new AppError('EXPENSE_CATEGORY_NAME_TAKEN')
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateExpenseCategoryDto): Promise<ExpenseCategoryDto> {
    return this.toDto(await this.repo.update(data))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(category: ExpenseCategory): ExpenseCategoryDto {
    return { ...category }
  }
}
