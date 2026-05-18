import { getDb } from '../../core'
import { ContactRepository } from '../../repositories/contact/contact.repository'

let _instance: ContactRepository | null = null

export function getContactRepository(): ContactRepository {
  if (!_instance) _instance = new ContactRepository(getDb())
  return _instance
}
