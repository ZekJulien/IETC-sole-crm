import { Contact } from '@db/client'
import { ContactRepository } from '../../repositories/client/contact.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { ContactDto, CreateContactDto, UpdateContactDto } from '@shared/dtos/client'

export class ContactService extends BaseService<Contact, ContactDto> {
  constructor(private readonly repo: ContactRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<ContactDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async getByClientId(clientId: number): Promise<ContactDto[]> {
    return (await this.repo.findByClientId(clientId)).map(c => this.toDto(c))
  }

  async add(data: CreateContactDto): Promise<ContactDto> {
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateContactDto): Promise<ContactDto> {
    return this.toDto(await this.repo.update(data))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(contact: Contact): ContactDto {
    return { ...contact }
  }
}
