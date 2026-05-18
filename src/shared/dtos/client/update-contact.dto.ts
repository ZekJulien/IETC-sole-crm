export interface UpdateContactDto {
  id:          number
  lastName?:   string
  firstName?:  string | null
  email?:      string | null
  phone?:      string | null
  role?:       string | null
}
