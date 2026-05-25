export interface TimeEntryDto {
  id:          number
  duration:    number
  date:        Date
  description: string | null
  billable:    boolean
  pomodoro:    boolean
  taskId:      number | null
  projectId:   number
  projectName: string
  taskTitle:   string | null
}
