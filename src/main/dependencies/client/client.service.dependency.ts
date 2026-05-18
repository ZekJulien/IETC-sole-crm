import { ClientService } from '../../services/client/client.service'
import { getClientRepository } from './client.repository.dependency'

let _instance: ClientService | null = null

export function getClientService(): ClientService {
  if (!_instance) _instance = new ClientService(getClientRepository())
  return _instance
}
