import { ipcRenderer } from 'electron'
import { PRODUCT_CHANNELS } from '@shared/channels/product'
import { ProductAPI } from '@shared/interfaces/product'

export const productApi: ProductAPI = {
  get:    (args) => ipcRenderer.invoke(PRODUCT_CHANNELS.GET, args),
  add:    (data) => ipcRenderer.invoke(PRODUCT_CHANNELS.ADD, data),
  update: (data) => ipcRenderer.invoke(PRODUCT_CHANNELS.UPDATE, data),
  remove: (id)   => ipcRenderer.invoke(PRODUCT_CHANNELS.REMOVE, id),
}
