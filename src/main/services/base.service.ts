import { PaginatedResult } from '@shared/types'

export abstract class BaseService<TEntity, TDto> {
  protected abstract toDto(entity: TEntity): TDto

  protected mapMany(result: PaginatedResult<TEntity>): PaginatedResult<TDto> {
    return { ...result, data: result.data.map(e => this.toDto(e)) }
  }

  protected mapOne(entity: TEntity | null): TDto | null {
    return entity ? this.toDto(entity) : null
  }
}
