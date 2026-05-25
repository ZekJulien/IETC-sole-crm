import { TimeEntry, Project, Task } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'
import { TimeEntryFilter, ProjectDurationCount } from '@shared/dtos/time-entry'

export type TimeEntryWithRelations = TimeEntry & { project: Project; task: Task | null }

export class TimeEntryRepository extends BaseRepository<TimeEntry> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.timeEntry,
      { include: { project: true, task: true }, orderBy: { date: 'desc' } },
      ['description'],
    )
  }

  findAll(filter?: TimeEntryFilter): Promise<TimeEntryWithRelations[]> {
    const where: Record<string, unknown> = {}
    if (filter?.projectId) where['projectId'] = filter.projectId
    if (filter?.from || filter?.to) {
      const range: Record<string, Date> = {}
      if (filter.from) range['gte'] = filter.from
      if (filter.to)   range['lte'] = endOfDay(filter.to)
      where['date'] = range
    }
    return this.delegate.findMany({
      where,
      include: { project: true, task: true },
      orderBy: { date: 'desc' },
    })
  }

  findByIdWithRelations(id: number): Promise<TimeEntryWithRelations | null> {
    return this.delegate.findUnique({ where: { id }, include: { project: true, task: true } })
  }

  async sumByProject(): Promise<ProjectDurationCount> {
    const groups: { projectId: number; _sum: { duration: number | null } }[] =
      await this.delegate.groupBy({ by: ['projectId'], _sum: { duration: true } })
    return Object.fromEntries(groups.map(g => [g.projectId, g._sum.duration ?? 0])) as ProjectDurationCount
  }

  async sumByMonth(year: number, month: number): Promise<number> {
    const start = new Date(year, month - 1, 1)
    const end   = new Date(year, month, 1)
    const res: { _sum: { duration: number | null } } = await this.delegate.aggregate({
      _sum:  { duration: true },
      where: { date: { gte: start, lt: end } },
    })
    return res._sum.duration ?? 0
  }
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}
