import { CATEGORY_CHANNELS } from '@shared/channels/category'
import { CreateCategorySchema, UpdateCategorySchema } from '@shared/dtos/category'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { CategoryService } from '../../services/category/category.service'

export function registerCategoryHandlers(service: CategoryService): void {
  ipcHandle(CATEGORY_CHANNELS.GET,    FindManyArgsSchema,   (args) => service.get(args))
  ipcHandle(CATEGORY_CHANNELS.ADD,    CreateCategorySchema, (data) => service.add(data))
  ipcHandle(CATEGORY_CHANNELS.UPDATE, UpdateCategorySchema, (data) => service.update(data))
  ipcHandle(CATEGORY_CHANNELS.REMOVE, IdSchema,             (id)   => service.remove(id))
}
