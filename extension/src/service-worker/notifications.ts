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

export const shouldNotifyUser = async (): Promise<boolean> => {
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

  for (const dayPrior of daysPrior) {
    if (
      (extensionOptions.dailyTimeEntryReminder && !summary.daysFilled[dayPrior]) ||
      summary.weekStatus === 'some-unsaved'
    ) {
      return true
    }
  }

  if (summary.alertableLastDayOfMonth && extensionOptions.endOfMonthTimesheetReminder) {
    const alertableLastDayOfMonthIndex = dayOfWeekIndexes[summary.alertableLastDayOfMonth]
    if (dayOfWeekIndex >= alertableLastDayOfMonthIndex && summary.weekStatus !== 'all-submitted-or-approved') {
      return true
    }
  }

  return (
    extensionOptions.endOfWeekTimesheetReminder &&
    dayOfWeekIndex >= dueDayOfWeekIndex &&
    summary.weekStatus !== 'all-submitted-or-approved'
  )
}
