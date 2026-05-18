export interface CreateContactDto {
  clientId:   number
  lastName:   string
  firstName?: string
  email?:     string
  phone?:     string
  role?:      string
}
