export interface ContactDto {
  id:        number
  lastName:  string
  firstName: string | null
  email:     string | null
  phone:     string | null
  role:      string | null
  clientId:  number
}
