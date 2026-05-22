import { ProjectService } from '../../services/project/project.service'
import { getProjectRepository } from './project.repository.dependency'

let _instance: ProjectService | null = null

export function getProjectService(): ProjectService {
  if (!_instance) _instance = new ProjectService(getProjectRepository())
  return _instance
}
