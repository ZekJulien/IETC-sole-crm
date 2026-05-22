import { PROJECT_CHANNELS } from '@shared/channels/project'
import { CreateProjectSchema, UpdateProjectSchema } from '@shared/dtos/project'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { ProjectService } from '../../services/project/project.service'

export function registerProjectHandlers(service: ProjectService): void {
  ipcHandle(PROJECT_CHANNELS.GET,       FindManyArgsSchema,  (args) => service.get(args))
  ipcHandle(PROJECT_CHANNELS.GET_BY_ID, IdSchema,            (id)   => service.getById(id))
  ipcHandle(PROJECT_CHANNELS.ADD,       CreateProjectSchema, (data) => service.add(data))
  ipcHandle(PROJECT_CHANNELS.UPDATE,    UpdateProjectSchema, (data) => service.update(data))
  ipcHandle(PROJECT_CHANNELS.REMOVE,    IdSchema,            (id)   => service.remove(id))
}
