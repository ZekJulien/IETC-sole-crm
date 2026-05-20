import { getDbContext } from '../../core'
import { ClientRepository } from '../../repositories/client/client.repository'

let _instance: ClientRepository | null = null

export function getClientRepository(): ClientRepository {
  if (!_instance) _instance = new ClientRepository(getDbContext())
  return _instance
}
