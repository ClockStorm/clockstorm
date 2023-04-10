import { addDays, DateOnly, toDateOnlyKey } from '../types/dates'
import { TimeSheet } from '../types/time-sheet'

export const getTimeSheet = async (weekMondayDate: DateOnly): Promise<TimeSheet> => {
  const key = `timesheet-${toDateOnlyKey(weekMondayDate)}`
  const result = await chrome.storage.local.get([key])

  const fallbackTimeSheet = TimeSheet.parse({
    dates: {
      monday: weekMondayDate,
      tuesday: addDays(weekMondayDate, 1),
      wednesday: addDays(weekMondayDate, 2),
      thursday: addDays(weekMondayDate, 3),
      friday: addDays(weekMondayDate, 4),
      saturday: addDays(weekMondayDate, 5),
      sunday: addDays(weekMondayDate, 6),
    },
    timeCards: [],
  })

  if (!result[key]) {
    return fallbackTimeSheet
  }

  const parseResult = TimeSheet.safeParse(result[key])

  if (parseResult.success) {
    return parseResult.data
  }

  return fallbackTimeSheet
}
