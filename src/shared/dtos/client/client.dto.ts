import { ClientType } from './client-type.enum'
import { ContactDto } from './contact.dto'

export interface ClientDto {
  id:            number
  name:          string
  email:         string | null
  phone:         string | null
  street:        string | null
  zipCode:       string | null
  city:          string | null
  country:       string | null
  type:          ClientType
  companyNumber: string | null
  vatNumber:     string | null
  peppolId:      string | null
  notes:         string | null
  archived:      boolean
  createdAt:     Date
  updatedAt:     Date
  contacts?:     ContactDto[]
}
