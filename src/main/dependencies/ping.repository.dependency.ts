import { getDb } from '../core'
import { PingRepository } from '../repositories'

export function makePingRepository(): PingRepository {
  return new PingRepository(getDb())
}
