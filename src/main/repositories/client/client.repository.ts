import { Client, Prisma } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class ClientRepository extends BaseRepository<Client> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.client,
      { orderBy: { name: 'asc' } },
      ['name', 'firstName', 'email', 'city'],
    )
  }

  findByIdWithRelation(id: number): Promise<Prisma.ClientGetPayload<{ include: { contacts: true } }> | null> {
    return this.delegate.findUnique({ where: { id }, include: { contacts: true } })
  }
}
