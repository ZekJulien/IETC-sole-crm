import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { ClientDto, CreateClientDto, UpdateClientDto } from '../../dtos/client'

export interface ClientAPI {
  get:      (args?: FindManyArgs)      => Promise<IpcResponse<PaginatedResult<ClientDto>>>
  getById:  (id: number)               => Promise<IpcResponse<ClientDto | null>>
  add:      (data: CreateClientDto)    => Promise<IpcResponse<ClientDto>>
  update:   (data: UpdateClientDto)    => Promise<IpcResponse<ClientDto>>
  remove:   (id: number)               => Promise<IpcResponse<void>>
}
