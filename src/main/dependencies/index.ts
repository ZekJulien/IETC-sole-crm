import { PingService } from '../services'
import { makePingService } from './ping.service.dependency'

export interface AppDependencies {
  pingService: PingService
}

export function buildDependencies(): AppDependencies {
  return {
    pingService: makePingService(),
  }
}
