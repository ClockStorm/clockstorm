import { getExtensionOptions } from '../extension-options/storage'
import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import {
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

  for (const dayPrior of daysPrior) {
    if (
      (extensionOptions.dailyTimeEntryReminder && !summary.daysFilled[dayPrior]) ||
      summary.weekStatus === 'some-unsaved'
    ) {
      return true
    }
  }

  const dayOfWeekIndex = dayOfWeekIndexes[dayOfWeek]
  const thursdayIndex = dayOfWeekIndexes.thursday

  return (
    extensionOptions.endOfWeekTimesheetReminder &&
    dayOfWeekIndex >= thursdayIndex &&
    summary.weekStatus !== 'all-submitted-or-approved'
  )
}
