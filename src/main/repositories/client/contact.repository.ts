import { Contact } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class ContactRepository extends BaseRepository<Contact> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.contact,
      undefined,
      ['lastName', 'firstName', 'email'],
    )
  }

  findByClientId(clientId: number): Promise<Contact[]> {
    return this.delegate.findMany({ where: { clientId } })
  }
}
