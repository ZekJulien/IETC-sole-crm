import { PrismaClient, Client, Prisma } from '@db/client'
import { BaseRepository } from '../base.repository'

export class ClientRepository extends BaseRepository<Client> {
  constructor(db: PrismaClient) {
    super(db.client, { orderBy: { name: 'asc' } }, ['name', 'email', 'city'])
  }

  findByIdWithRelation(id: number): Promise<Prisma.ClientGetPayload<{ include: { contacts: true } }> | null> {
    return this.delegate.findUnique({ where: { id }, include: { contacts: true } })
  }
}
