import { ipcRenderer } from 'electron'
import { CATEGORY_CHANNELS } from '@shared/channels/category'
import { CategoryAPI } from '@shared/interfaces/category'

export const categoryApi: CategoryAPI = {
  get:    (args)  => ipcRenderer.invoke(CATEGORY_CHANNELS.GET, args),
  add:    (data)  => ipcRenderer.invoke(CATEGORY_CHANNELS.ADD, data),
  update: (data)  => ipcRenderer.invoke(CATEGORY_CHANNELS.UPDATE, data),
  remove: (id)    => ipcRenderer.invoke(CATEGORY_CHANNELS.REMOVE, id),
}
