import { Client, Contact } from '@db/client'
import { ClientRepository } from '../../repositories/client/client.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { ClientDto, CreateClientDto, UpdateClientDto, ClientType } from '@shared/dtos/client'
import { AppError } from '../../errors/app-error'

export class ClientService extends BaseService<Client, ClientDto> {
  constructor(private readonly repo: ClientRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<ClientDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async getByIdWithRelation(id: number): Promise<ClientDto | null> {
    return this.mapOne(await this.repo.findByIdWithRelation(id))
  }

  async add(data: CreateClientDto): Promise<ClientDto> {
    if (data.email && await this.repo.isExist('email', data.email))
      throw new AppError('EMAIL_ALREADY_IN_USE')
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateClientDto): Promise<ClientDto> {
    return this.toDto(await this.repo.update(data))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(client: Client & { contacts?: Contact[] }): ClientDto {
    return { ...client, type: client.type as ClientType }
  }
}
