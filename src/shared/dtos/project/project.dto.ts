import { ProjectStatus } from './project-status.enum'
import { ClientDto } from '../client'
import { CategoryDto } from '../category'

export interface ProjectDto {
  id:          number
  name:        string
  description: string | null
  status:      ProjectStatus
  startDate:   Date | null
  endDate:     Date | null
  hourlyRate:  number | null
  dailyRate:   number | null
  budget:      number | null
  clientId:    number
  createdAt:   Date
  updatedAt:   Date
  client?:     ClientDto
  categories?: CategoryDto[]
}
