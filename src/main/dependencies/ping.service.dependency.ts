import { makePingRepository } from './ping.repository.dependency'
import { PingService } from '../services'

export function makePingService(): PingService {
  return new PingService(makePingRepository())
}
