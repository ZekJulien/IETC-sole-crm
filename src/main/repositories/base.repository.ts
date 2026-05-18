import { FindManyArgs, PaginatedResult } from '@shared/types'
import { UpdateInput } from './types/repository-inputs.type'

export class BaseRepository<T extends { id: number }> {
  constructor(
    protected readonly delegate: any,
    protected readonly defaultArgs?: { include?: any; orderBy?: any },
    private readonly searchFields?: (keyof T & string)[]
  ) {}

  findById(id: number): Promise<T | null> {
    return this.delegate.findUnique({ where: { id }, include: this.defaultArgs?.include })
  }

  async findMany(args?: FindManyArgs): Promise<PaginatedResult<T>> {
    const searchWhere = args?.search && this.searchFields?.length
      ? { OR: this.searchFields.map(f => ({ [f]: { contains: args.search } })) }
      : undefined

    const where = args?.where && searchWhere
      ? { AND: [args.where, searchWhere] }
      : args?.where ?? searchWhere

    const [data, total] = await Promise.all([
      this.delegate.findMany({ ...this.defaultArgs, where, skip: args?.skip, take: args?.take }),
      args?.count ? this.delegate.count({ where }) : Promise.resolve(undefined),
    ])

    return { data, total }
  }

  create(data: any): Promise<T> {
    return this.delegate.create({ data })
  }

  update(input: UpdateInput<T>): Promise<T> {
    const { id, ...data } = input as { id: number } & Record<string, unknown>
    return this.delegate.update({ where: { id }, data })
  }

  async isExist(field: keyof T & string, value: unknown): Promise<boolean> {
    const count = await this.delegate.count({ where: { [field]: value } })
    return count > 0
  }

  async remove(id: number): Promise<void> {
    await this.delegate.delete({ where: { id } })
  }
}
