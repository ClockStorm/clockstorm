import { TimeSheet } from '../types/time-sheet'

export interface DataSource {
  queryTimeSheet: () => Promise<TimeSheet | null>
}
