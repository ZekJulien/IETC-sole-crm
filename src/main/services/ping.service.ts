import { Ping } from '@shared/interfaces'
import { PingRepository } from '../repositories'

export class PingService {
  constructor(private repo: PingRepository) {}

  async getAll(): Promise<Ping[]> {
    return this.repo.getAll()
  }

  async send(message: string): Promise<Ping> {
    return this.repo.send(message)
  }
}
