import { PrismaClient } from '@db/client'
import { Ping } from '@shared/interfaces'

export class PingRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<Ping[]> {
    return this.prisma.ping.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async send(message: string): Promise<Ping> {
    return this.prisma.ping.create({ data: { message } })
  }
}
