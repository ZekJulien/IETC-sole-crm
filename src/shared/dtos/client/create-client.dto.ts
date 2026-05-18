import { ClientType } from './client-type.enum'

export interface CreateClientDto {
  name:           string
  email?:         string
  phone?:         string
  street?:        string
  zipCode?:       string
  city?:          string
  country?:       string
  type?:          ClientType
  companyNumber?: string
  vatNumber?:     string
  peppolId?:      string
  notes?:         string
}
