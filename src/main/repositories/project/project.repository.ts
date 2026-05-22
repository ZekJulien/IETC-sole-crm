import { Project, Prisma } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

const projectInclude = {
  client:     true,
  categories: { include: { category: true } },
} satisfies Prisma.ProjectInclude

export type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>

export class ProjectRepository extends BaseRepository<Project> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.project,
      { include: projectInclude, orderBy: { createdAt: 'desc' } },
      ['name'],
    )
  }

  findByIdWithRelation(id: number): Promise<ProjectWithRelations | null> {
    return this.delegate.findUnique({ where: { id }, include: projectInclude })
  }

  async findCategoryIds(projectId: number): Promise<number[]> {
    const links = await this.dbContext.client.projectCategory.findMany({
      where:  { projectId },
      select: { categoryId: true },
    })
    return links.map(l => l.categoryId)
  }

  linkCategory(projectId: number, categoryId: number): Promise<unknown> {
    return this.dbContext.client.projectCategory.create({ data: { projectId, categoryId } })
  }

  unlinkCategory(projectId: number, categoryId: number): Promise<unknown> {
    return this.dbContext.client.projectCategory.delete({
      where: { projectId_categoryId: { projectId, categoryId } },
    })
  }
}
