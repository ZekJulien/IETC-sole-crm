import { ClientType } from './client-type.enum'

export interface UpdateClientDto {
  id:             number
  name?:          string
  email?:         string | null
  phone?:         string | null
  street?:        string | null
  zipCode?:       string | null
  city?:          string | null
  country?:       string | null
  type?:          ClientType
  companyNumber?: string | null
  vatNumber?:     string | null
  peppolId?:      string | null
  notes?:         string | null
  archived?:      boolean
}
