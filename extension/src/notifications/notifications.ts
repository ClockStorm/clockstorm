import { getExtensionOptions } from '../extension-options/storage'
import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import {
  DayOfWeek,
  dayOfWeekIndexes,
  getAllDaysPriorInWeek,
  getDayOfWeek,
  getMondayOfDateOnly,
  getTodayDateOnly,
} from '../types/dates'

export type NotificationType = 'daily' | 'weekly' | 'monthly'

export const getActiveNotificationTypes = async (): Promise<NotificationType[]> => {
  const today = getTodayDateOnly()
  const dayOfWeek = getDayOfWeek(today)
  const monday = getMondayOfDateOnly(today)
  const timeSheet = await getTimeSheet(monday)
  const summary = summarizeTimeSheet(timeSheet)
  const daysPrior = getAllDaysPriorInWeek(dayOfWeek, true, true)
  const extensionOptions = await getExtensionOptions()
  const dayOfWeekIndex = dayOfWeekIndexes[dayOfWeek]
  const dueDayOfWeek: DayOfWeek = 'thursday'
  const dueDayOfWeekIndex = dayOfWeekIndexes[dueDayOfWeek]

  const results: NotificationType[] = []

  for (const dayPrior of daysPrior) {
    if (
      (extensionOptions.dailyTimeEntryReminder && !summary.daysFilled[dayPrior]) ||
      summary.weekStatus === 'some-unsaved'
    ) {
      results.push('daily')
      break
    }
  }

  if (
    extensionOptions.endOfWeekTimesheetReminder &&
    dayOfWeekIndex >= dueDayOfWeekIndex &&
    summary.weekStatus !== 'all-submitted-or-approved'
  ) {
    results.push('weekly')
  }

  if (summary.alertableLastDayOfMonth && extensionOptions.endOfMonthTimesheetReminder) {
    const alertableLastDayOfMonthIndex = dayOfWeekIndexes[summary.alertableLastDayOfMonth]
    if (dayOfWeekIndex >= alertableLastDayOfMonthIndex && summary.weekStatus !== 'all-submitted-or-approved') {
      results.push('monthly')
    }
  }

  return results
}
