import { PRODUCT_CHANNELS } from '@shared/channels/product'
import { CreateProductSchema, UpdateProductSchema } from '@shared/dtos/product'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { ProductService } from '../../services/product/product.service'

export function registerProductHandlers(service: ProductService): void {
  ipcHandle(PRODUCT_CHANNELS.GET,    FindManyArgsSchema,  (args) => service.get(args))
  ipcHandle(PRODUCT_CHANNELS.ADD,    CreateProductSchema, (data) => service.add(data))
  ipcHandle(PRODUCT_CHANNELS.UPDATE, UpdateProductSchema, (data) => service.update(data))
  ipcHandle(PRODUCT_CHANNELS.REMOVE, IdSchema,            (id)   => service.remove(id))
}
