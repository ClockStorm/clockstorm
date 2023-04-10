import { getEveryMondaySinceInstallation } from '../installation/helpers'
import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import {
  compareDateOnly,
  compareTimeOnly,
  DateOnly,
  DayOfWeek,
  daysOfWeek,
  getTimeOnly,
  getTodayDateOnly,
  TimeOnly,
} from '../types/dates'
import { ExtensionOptions } from '../types/extension-options'
import { TimeSheet, TimeSheetSummary } from '../types/time-sheet'

export interface DailyNotificationType {
  type: 'daily'
  dayOfWeek: DayOfWeek
}

export interface EndOfWeekNotificationType {
  type: 'end-of-week'
}

export interface EndOfMonthNotificationType {
  type: 'end-of-month'
}

export type NotificationType = DailyNotificationType | EndOfWeekNotificationType | EndOfMonthNotificationType

const isPastDueStartTime = (today: DateOnly, time: TimeOnly, dueDate: DateOnly, dueStartTime: TimeOnly): boolean => {
  const dateOnlyCompare = compareDateOnly(today, dueDate)

  if (dateOnlyCompare < 0) {
    return false
  }

  if (dateOnlyCompare === 0 && compareTimeOnly(time, dueStartTime) < 0) {
    return false
  }

  return true
}

const shouldRemindForDaily = (
  today: DateOnly,
  time: TimeOnly,
  dailyDayOfWeek: DayOfWeek,
  extensionOptions: ExtensionOptions,
  timeSheet: TimeSheet,
  summary: TimeSheetSummary,
): boolean => {
  if (!extensionOptions.dailyTimeEntryReminder || !extensionOptions.dailyReminderDaysOfWeek.includes(dailyDayOfWeek)) {
    return false
  }

  if (summary.daysFilled[dailyDayOfWeek] && summary.weekStatus !== 'some-unsaved') {
    return false
  }

  if (!isPastDueStartTime(today, time, timeSheet.dates[dailyDayOfWeek], extensionOptions.dailyReminderStartTime)) {
    return false
  }

  return true
}

const shouldRemindForEndOfWeek = (
  today: DateOnly,
  time: TimeOnly,
  extensionOptions: ExtensionOptions,
  timeSheet: TimeSheet,
  summary: TimeSheetSummary,
): boolean => {
  if (!extensionOptions.endOfWeekTimesheetReminder) {
    return false
  }

  if (summary.weekStatus === 'all-submitted-or-approved') {
    return false
  }

  if (
    !isPastDueStartTime(
      today,
      time,
      timeSheet.dates[extensionOptions.endOfWeekReminderDayOfWeek],
      extensionOptions.endOfWeekReminderStartTime,
    )
  ) {
    return false
  }

  return true
}

const shouldRemindForEndOfMonth = (
  today: DateOnly,
  time: TimeOnly,
  extensionOptions: ExtensionOptions,
  summary: TimeSheetSummary,
): boolean => {
  if (!extensionOptions.endOfMonthTimesheetReminder) {
    return false
  }

  if (!summary.endOfMonthReminderDate) {
    return false
  }

  // TODO: It might be nice to check only the parts of the time sheet that are related to the days leading up to the end of month due date.
  if (summary.weekStatus === 'all-submitted-or-approved') {
    return false
  }

  if (!isPastDueStartTime(today, time, summary.endOfMonthReminderDate, extensionOptions.endOfMonthReminderStartTime)) {
    return false
  }

  return true
}

export const getActiveNotificationTypes = async (
  timeSheet: TimeSheet,
  summary: TimeSheetSummary,
  extensionOptions: ExtensionOptions,
): Promise<NotificationType[]> => {
  const today = getTodayDateOnly()
  const timeOnly = getTimeOnly()

  const results: NotificationType[] = []

  for (const dailyDayOfWeek of daysOfWeek) {
    if (shouldRemindForDaily(today, timeOnly, dailyDayOfWeek, extensionOptions, timeSheet, summary)) {
      results.push({
        type: 'daily',
        dayOfWeek: dailyDayOfWeek,
      })
    }
  }

  if (shouldRemindForEndOfWeek(today, timeOnly, extensionOptions, timeSheet, summary)) {
    results.push({
      type: 'end-of-week',
    })
  }

  if (shouldRemindForEndOfMonth(today, timeOnly, extensionOptions, summary)) {
    results.push({
      type: 'end-of-month',
    })
  }

  return results
}

export const checkShouldNotify = async (extensionOptions: ExtensionOptions): Promise<boolean> => {
  const mondays = await getEveryMondaySinceInstallation()

  for (const monday of mondays) {
    const timeSheet = await getTimeSheet(monday)
    const summary = summarizeTimeSheet(timeSheet, extensionOptions)
    const activeNotificationTypes = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    if (activeNotificationTypes.length > 0) {
      return true
    }
  }

  return false
}
