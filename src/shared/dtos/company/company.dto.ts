import { CompanySettingsDto } from './company-settings.dto'

export interface CompanyDto {
  id:            string
  name:          string
  legalForm:     string | null
  street:        string | null
  zipCode:       string | null
  city:          string | null
  country:       string | null
  email:         string | null
  phone:         string | null
  website:       string | null
  companyNumber: string | null
  vatNumber:     string | null
  peppolId:      string | null
  iban:          string | null
  bic:           string | null
  logoPath:      string | null
  createdAt:     Date
  updatedAt:     Date
  settings:      CompanySettingsDto
}
