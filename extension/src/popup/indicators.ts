import { getTimeSheetNotifications } from '../notifications/notifications'
import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import { DateOnly } from '../types/dates'
import { ExtensionOptions } from '../types/extension-options'

type Direction = 'previous' | 'next'

export const checkShouldIndicatePreviousOrNextWeekReminders = async (
  mondays: DateOnly[],
  currentMondayIndex: number,
  direction: Direction,
  extensionOptions: ExtensionOptions,
): Promise<boolean> => {
  let mondayIndex = direction === 'previous' ? currentMondayIndex + 1 : currentMondayIndex - 1

  const boundaryCheck = (index: number) => {
    if (direction === 'previous') {
      return index < mondays.length
    } else {
      return index >= 0
    }
  }

  while (boundaryCheck(mondayIndex)) {
    const monday = mondays[mondayIndex]
    const timeSheet = await getTimeSheet(monday)
    const summary = summarizeTimeSheet(timeSheet, extensionOptions)
    const activeNotificationTypes = await getTimeSheetNotifications(timeSheet, summary, extensionOptions)

    if (activeNotificationTypes.length > 0) {
      return true
    }

    if (direction === 'previous') {
      mondayIndex++
    } else {
      mondayIndex--
    }
  }

  return false
}
