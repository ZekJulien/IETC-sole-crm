import { ContactService } from '../../services/client/contact.service'
import { getContactRepository } from './contact.repository.dependency'

let _instance: ContactService | null = null

export function getContactService(): ContactService {
  if (!_instance) _instance = new ContactService(getContactRepository())
  return _instance
}
