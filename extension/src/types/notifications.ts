import { DateOnly, DayOfWeek } from './dates'

export interface DailyNotification {
  type: 'daily'
  dayOfWeek: DayOfWeek
}

export interface EndOfWeekNotification {
  type: 'end-of-week'
}

export interface EndOfMonthNotification {
  type: 'end-of-month'
  endOfMonthDate: DateOnly
}

export type Notification = DailyNotification | EndOfWeekNotification | EndOfMonthNotification

export interface TimeSheetNotifications {
  monday: DateOnly
  notificationTypes: Notification[]
}

export interface Notifications {
  [startingMondayKey: string]: Notification[]
}
