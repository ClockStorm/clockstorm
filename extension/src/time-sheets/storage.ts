import { addDays, DateOnly, toDateOnlyKey } from '../types/dates'
import { isTimeSheet, TimeSheet } from '../types/time-sheet'

export const getTimeSheet = async (weekMondayDate: DateOnly): Promise<TimeSheet> => {
  const key = `timesheet-${toDateOnlyKey(weekMondayDate)}`
  const result = await chrome.storage.local.get([key])

  if (result[key] && isTimeSheet(result[key])) {
    return result[key]
  }

  return {
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
  }
}
