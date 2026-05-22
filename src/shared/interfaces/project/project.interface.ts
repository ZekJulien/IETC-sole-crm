import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '../../dtos/project'

export interface ProjectAPI {
  get:     (args?: FindManyArgs)    => Promise<IpcResponse<PaginatedResult<ProjectDto>>>
  getById: (id: number)             => Promise<IpcResponse<ProjectDto | null>>
  add:     (data: CreateProjectDto) => Promise<IpcResponse<ProjectDto>>
  update:  (data: UpdateProjectDto) => Promise<IpcResponse<ProjectDto>>
  remove:  (id: number)             => Promise<IpcResponse<void>>
}
