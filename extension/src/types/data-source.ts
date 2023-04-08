import { TimeSheet } from './time-sheet'

export interface DataSource {
  queryTimeSheet: () => Promise<TimeSheet | null>
}
