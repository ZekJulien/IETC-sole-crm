import { getDbContext } from '../../core'
import { ProjectRepository } from '../../repositories/project/project.repository'

let _instance: ProjectRepository | null = null

export function getProjectRepository(): ProjectRepository {
  if (!_instance) _instance = new ProjectRepository(getDbContext())
  return _instance
}
