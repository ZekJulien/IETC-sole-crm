import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { ContactDto, CreateContactDto, UpdateContactDto } from '../../dtos/client'

export interface ContactAPI {
  get:           (args?: FindManyArgs)      => Promise<IpcResponse<PaginatedResult<ContactDto>>>
  getByClientId: (clientId: number)         => Promise<IpcResponse<ContactDto[]>>
  add:           (data: CreateContactDto)   => Promise<IpcResponse<ContactDto>>
  update:        (data: UpdateContactDto)   => Promise<IpcResponse<ContactDto>>
  remove:        (id: number)               => Promise<IpcResponse<void>>
}
