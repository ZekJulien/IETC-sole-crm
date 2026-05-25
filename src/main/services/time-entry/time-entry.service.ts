import { TimeEntryRepository, TimeEntryWithRelations } from '../../repositories/time-entry/time-entry.repository'
import { BaseService } from '../base.service'
import {
  TimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto,
  TimeEntryFilter, SumByMonthDto, ProjectDurationCount,
} from '@shared/dtos/time-entry'

export class TimeEntryService extends BaseService<TimeEntryWithRelations, TimeEntryDto> {
  constructor(private readonly repo: TimeEntryRepository) { super() }

  async getAll(filter?: TimeEntryFilter): Promise<TimeEntryDto[]> {
    const entries = await this.repo.findAll(filter)
    return entries.map(e => this.toDto(e))
  }

  sumByProject(): Promise<ProjectDurationCount> {
    return this.repo.sumByProject()
  }

  sumByMonth(arg: SumByMonthDto): Promise<number> {
    return this.repo.sumByMonth(arg.year, arg.month)
  }

  async add(data: CreateTimeEntryDto): Promise<TimeEntryDto> {
    const created = await this.repo.create(data)
    return this.toDto((await this.repo.findByIdWithRelations(created.id))!)
  }

  async update(data: UpdateTimeEntryDto): Promise<TimeEntryDto> {
    await this.repo.update(data)
    return this.toDto((await this.repo.findByIdWithRelations(data.id))!)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(e: TimeEntryWithRelations): TimeEntryDto {
    return {
      id:          e.id,
      duration:    e.duration,
      date:        e.date,
      description: e.description,
      billable:    e.billable,
      pomodoro:    e.pomodoro,
      taskId:      e.taskId,
      projectId:   e.projectId,
      projectName: e.project.name,
      taskTitle:   e.task?.title ?? null,
    }
  }
}
