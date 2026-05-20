import { getDbContext } from '../../core'
import { ContactRepository } from '../../repositories/client/contact.repository'

let _instance: ContactRepository | null = null

export function getContactRepository(): ContactRepository {
  if (!_instance) _instance = new ContactRepository(getDbContext())
  return _instance
}
