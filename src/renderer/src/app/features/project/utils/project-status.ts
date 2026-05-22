import { ProjectStatus } from '@shared/dtos/project'

export const PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.PROSPECT,
  ProjectStatus.IN_PROGRESS,
  ProjectStatus.ON_HOLD,
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELLED,
]

export function projectStatusKey(status: ProjectStatus | string): string {
  return 'project.status.' + String(status).toLowerCase()
}
