import { TableColumnType } from '../../types/data-table'

export interface TableColumn<T = Record<string, unknown>> {
  key:       keyof T & string
  labelKey:  string
  type?:     TableColumnType
  sortable?: boolean
  width?:    string
}
