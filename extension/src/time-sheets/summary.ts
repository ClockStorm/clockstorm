import { addDays, DateOnly, DayOfWeek, dayOfWeekIndexes, getLastDayOfMonth } from '../types/dates'
import { ExtensionOptions } from '../types/extension-options'
import { DaysFilled, TimeSheet, TimeSheetSummary, WeekStatus } from '../types/time-sheet'

const determineWeekStatusFromTimeCards = (timeSheet: TimeSheet): WeekStatus => {
  if (!timeSheet.timeCards.length) {
    return 'no-time-cards'
  }

  const firstUnsaved = timeSheet.timeCards.find((timeCard) => timeCard.status === 'unsaved')
  if (firstUnsaved) {
    return 'some-unsaved'
  }

  if (timeSheet.timeCards.every((timeCard) => timeCard.status === 'submitted' || timeCard.status === 'approved')) {
    return 'all-submitted-or-approved'
  }

  return 'some-unsubmitted'
}

const determineDaysFilledFromTimeCards = (timeSheet: TimeSheet): DaysFilled => {
  const daysFilled: DaysFilled = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  }

  for (const timeCard of timeSheet.timeCards) {
    for (const day of Object.keys(daysFilled)) {
      const dayOfWeek = day as DayOfWeek
      if (timeCard.hours[dayOfWeek] > 0) {
        daysFilled[dayOfWeek] = true
      }
    }
  }

  return daysFilled
}

const determineTotalDaysSubmittedFromTimeCards = (timeSheet: TimeSheet): number => {
  let totalDaysSubmitted = 0

  for (const timeCard of timeSheet.timeCards.filter(
    (timeCard) => timeCard.status === 'submitted' || timeCard.status === 'approved',
  )) {
    for (const day of Object.keys(timeCard.hours)) {
      const dayOfWeek = day as DayOfWeek
      if (timeCard.hours[dayOfWeek] > 0) {
        totalDaysSubmitted++
      }
    }
  }

  return totalDaysSubmitted
}

const determineTotalDaysSavedFromTimeCards = (timeSheet: TimeSheet): number => {
  let totalDaysSaved = 0

  for (const timeCard of timeSheet.timeCards.filter((timeCard) => timeCard.status === 'saved')) {
    for (const day of Object.keys(timeCard.hours)) {
      const dayOfWeek = day as DayOfWeek
      if (timeCard.hours[dayOfWeek] > 0) {
        totalDaysSaved++
      }
    }
  }

  return totalDaysSaved
}

const determineNextDueDate = (
  timeSheet: TimeSheet,
  extensionOptions: ExtensionOptions,
  endOfMonthReminderDate: DateOnly | null,
): Date => {
  const now = new Date()

  if (endOfMonthReminderDate) {
    const endOfMonthDueDate = new Date(
      endOfMonthReminderDate.year,
      endOfMonthReminderDate.month - 1,
      endOfMonthReminderDate.day,
      extensionOptions.endOfMonthReminderDueTime.hour,
      extensionOptions.endOfMonthReminderDueTime.minute,
      0,
    )

    // If we have not yet past the end of month due date, return that date
    if (now.getTime() <= endOfMonthDueDate.getTime()) {
      return endOfMonthDueDate
    }
  }

  const dueDateDayOfWeekIndex = dayOfWeekIndexes[extensionOptions.endOfWeekReminderDayOfWeek]
  const dueDateOnly = addDays(timeSheet.dates.monday, dueDateDayOfWeekIndex)
  const endOfWeekDueDate = new Date(
    dueDateOnly.year,
    dueDateOnly.month - 1,
    dueDateOnly.day,
    extensionOptions.endOfWeekReminderDueTime.hour,
    extensionOptions.endOfWeekReminderDueTime.minute,
    0,
  )

  return endOfWeekDueDate
}

const determineTimeRemaining = (
  timeSheet: TimeSheet,
  extensionOptions: ExtensionOptions,
  endOfMonthReminderDate: DateOnly | null,
): string => {
  const now = new Date()
  const nextDueDate = determineNextDueDate(timeSheet, extensionOptions, endOfMonthReminderDate)
  const dueDateMillisecondsRemaining = nextDueDate.getTime() - now.getTime()

  if (dueDateMillisecondsRemaining < 0) {
    return '00:00:00'
  } else {
    const hours = Math.floor(dueDateMillisecondsRemaining / 3600000)
    const minutes = Math.floor((dueDateMillisecondsRemaining % 3600000) / 60000)
    const seconds = Math.floor((dueDateMillisecondsRemaining % 60000) / 1000)
    return `${hours.toString(10).padStart(2, '0')}:${minutes.toString(10).padStart(2, '0')}:${seconds
      .toString(10)
      .padStart(2, '0')}`
  }
}

const determineEndOfMonthReminderDate = (timeSheet: TimeSheet, extensionOptions: ExtensionOptions): DateOnly | null => {
  const monday = timeSheet.dates.monday
  const lastDayOfMonth = getLastDayOfMonth(monday.month, monday.year)
  const matchingEntries = Object.entries(timeSheet.dates).filter(
    ([_, date]) => date.month === monday.month && date.year === monday.year && date.day === lastDayOfMonth,
  )

  if (!matchingEntries.length) {
    return null
  }

  const lastDayOfMonthDayOfWeek = matchingEntries[0][0] as DayOfWeek
  const lastDayOfMonthDayOfWeekIndex = dayOfWeekIndexes[lastDayOfMonthDayOfWeek]
  const dueDateDayOfWeekIndex = dayOfWeekIndexes[extensionOptions.endOfWeekReminderDayOfWeek]

  // If the last day of the month is after or on the actual due date, then we can just return null.
  if (lastDayOfMonthDayOfWeekIndex >= dueDateDayOfWeekIndex) {
    return null
  }

  return timeSheet.dates[lastDayOfMonthDayOfWeek]
}

export const summarizeTimeSheet = (timeSheet: TimeSheet, extensionOptions: ExtensionOptions): TimeSheetSummary => {
  const endOfMonthReminderDate = determineEndOfMonthReminderDate(timeSheet, extensionOptions)
  return {
    weekStatus: determineWeekStatusFromTimeCards(timeSheet),
    daysFilled: determineDaysFilledFromTimeCards(timeSheet),
    totalDaysSubmitted: determineTotalDaysSubmittedFromTimeCards(timeSheet),
    totalDaysSaved: determineTotalDaysSavedFromTimeCards(timeSheet),
    timeRemaining: determineTimeRemaining(timeSheet, extensionOptions, endOfMonthReminderDate),
    endOfMonthReminderDate,
  }
}
