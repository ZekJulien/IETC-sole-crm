import { Project, Client, Category } from '@db/client'
import { ProjectRepository } from '../../repositories/project/project.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { ProjectDto, CreateProjectDto, UpdateProjectDto, ProjectStatus } from '@shared/dtos/project'
import { ClientType } from '@shared/dtos/client'

export class ProjectService extends BaseService<Project, ProjectDto> {
  constructor(private readonly repo: ProjectRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<ProjectDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async getById(id: number): Promise<ProjectDto | null> {
    return this.mapOne(await this.repo.findByIdWithRelation(id))
  }

  async add(data: CreateProjectDto): Promise<ProjectDto> {
    const { categoryIds, ...fields } = data
    const created = await this.repo.create(fields)
    for (const categoryId of categoryIds ?? [])
      await this.repo.linkCategory(created.id, categoryId)
    return this.toDto((await this.repo.findByIdWithRelation(created.id))!)
  }

  async update(data: UpdateProjectDto): Promise<ProjectDto> {
    const { categoryIds, ...fields } = data
    await this.repo.update(fields)
    if (categoryIds) await this.syncCategories(data.id, categoryIds)
    return this.toDto((await this.repo.findByIdWithRelation(data.id))!)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  private async syncCategories(projectId: number, nextIds: number[]): Promise<void> {
    const current  = await this.repo.findCategoryIds(projectId)
    const toAdd    = nextIds.filter(id => !current.includes(id))
    const toRemove = current.filter(id => !nextIds.includes(id))
    for (const id of toAdd)    await this.repo.linkCategory(projectId, id)
    for (const id of toRemove) await this.repo.unlinkCategory(projectId, id)
  }

  protected toDto(p: Project & {
    client?:     Client | null
    categories?: { category: Category }[]
  }): ProjectDto {
    return {
      id:          p.id,
      name:        p.name,
      description: p.description,
      status:      p.status as ProjectStatus,
      startDate:   p.startDate,
      endDate:     p.endDate,
      hourlyRate:  p.hourlyRate,
      dailyRate:   p.dailyRate,
      budget:      p.budget,
      clientId:    p.clientId,
      createdAt:   p.createdAt,
      updatedAt:   p.updatedAt,
      client:      p.client ? { ...p.client, type: p.client.type as ClientType } : undefined,
      categories:  p.categories?.map(pc => pc.category),
    }
  }
}
