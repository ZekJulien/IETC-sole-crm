import { PrismaClient, Contact } from '@db/client'
import { BaseRepository } from '../base.repository'

export class ContactRepository extends BaseRepository<Contact> {
  constructor(db: PrismaClient) {
    super(db.contact, undefined, ['lastName', 'firstName', 'email'])
  }

  findByClientId(clientId: number): Promise<Contact[]> {
    return this.delegate.findMany({ where: { clientId } })
  }
}
