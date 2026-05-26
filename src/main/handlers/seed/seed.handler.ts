import { SEED_CHANNELS } from '@shared/channels/seed'
import { ipcHandleNoTx } from '../../core/ipc.handle'
import { SeedService } from '../../services/seed'

export function registerSeedHandlers(service: SeedService): void {
  ipcHandleNoTx(SEED_CHANNELS.REQUIRED_DEFAULTS, () => service.seedRequiredDefaults())
  ipcHandleNoTx(SEED_CHANNELS.DEMO,              () => service.seedDemoData())
  ipcHandleNoTx(SEED_CHANNELS.RESET,             () => service.reset())
}
