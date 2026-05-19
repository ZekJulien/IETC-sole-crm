import { TableColumnType } from '../../types/data-table'

export interface TableColumn<T = Record<string, unknown>> {
  key:              keyof T & string
  labelKey:         string
  type?:            TableColumnType
  sortable?:        boolean
  width?:           string
  /** Pour les colonnes type 'badge' : préfixe i18n à appliquer à la valeur (lowercased). Ex : "client.type." + "individual". */
  badgeI18nPrefix?: string
}
