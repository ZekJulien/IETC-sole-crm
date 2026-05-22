import { Task } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class TaskRepository extends BaseRepository<Task> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.task,
      { orderBy: { createdAt: 'desc' } },
      ['title'],
    )
  }

  findByProjectId(projectId: number): Promise<Task[]> {
    return this.delegate.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } })
  }

  async countByStatus(projectId: number): Promise<Record<string, number>> {
    const groups: { status: string; _count: { _all: number } }[] = await this.delegate.groupBy({
      by:     ['status'],
      where:  { projectId },
      _count: { _all: true },
    })
    return Object.fromEntries(groups.map(g => [g.status, g._count._all]))
  }
}
