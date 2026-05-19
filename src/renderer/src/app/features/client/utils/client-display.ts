import { ClientDto } from '@shared/dtos/client'

export function displayClientName(client: ClientDto): string {
  return client.firstName ? `${client.firstName} ${client.name}` : client.name
}
