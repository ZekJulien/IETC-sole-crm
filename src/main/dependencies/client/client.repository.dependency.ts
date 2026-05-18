import { getDb } from '../../core'
import { ClientRepository } from '../../repositories/client/client.repository'

let _instance: ClientRepository | null = null

export function getClientRepository(): ClientRepository {
  if (!_instance) _instance = new ClientRepository(getDb())
  return _instance
}
