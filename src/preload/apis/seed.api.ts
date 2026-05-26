import { ipcRenderer } from 'electron'
import { SEED_CHANNELS } from '@shared/channels/seed'
import { SeedAPI } from '@shared/interfaces/seed'

export const seedApi: SeedAPI = {
  requiredDefaults: () => ipcRenderer.invoke(SEED_CHANNELS.REQUIRED_DEFAULTS),
  demo:             () => ipcRenderer.invoke(SEED_CHANNELS.DEMO),
  reset:            () => ipcRenderer.invoke(SEED_CHANNELS.RESET),
}
