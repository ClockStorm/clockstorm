import {
  addDays,
  DayOfWeek,
  dayOfWeekIndexes,
  getDayOfWeek,
  getLastDayOfMonth,
  getTodayDateOnly,
  isBusinessDayOfWeek,
} from '../types/dates'
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

const determineNextDueDate = (timeSheet: TimeSheet, alertableLastDayOfMonth: DayOfWeek | null): Date => {
  const deadlineHour = 17 // 5pm
  const now = new Date()

  if (alertableLastDayOfMonth) {
    const todayDateOnly = getTodayDateOnly()
    const todayDayOfWeek = getDayOfWeek(todayDateOnly)
    const todayDayOfWeekIndex = dayOfWeekIndexes[todayDayOfWeek]
    const alertableLastDayOfMonthIndex = dayOfWeekIndexes[alertableLastDayOfMonth]
    const alertableDateOnly = addDays(todayDateOnly, alertableLastDayOfMonthIndex - todayDayOfWeekIndex)

    const alertableDueDate = new Date(
      alertableDateOnly.year,
      alertableDateOnly.month - 1,
      alertableDateOnly.day,
      deadlineHour,
      0,
      0,
    )

    // If we have not yet past the alertable due date, return that date
    if (now.getTime() <= alertableDueDate.getTime()) {
      return alertableDueDate
    }
  }

  const dueDateOnly = addDays(timeSheet.dates.monday, 3)
  const dueDate = new Date(dueDateOnly.year, dueDateOnly.month - 1, dueDateOnly.day, deadlineHour, 0, 0)

  return dueDate
}

const determineTimeRemaining = (timeSheet: TimeSheet, alertableLastDayOfMonth: DayOfWeek | null): string => {
  const now = new Date()
  const nextDueDate = determineNextDueDate(timeSheet, alertableLastDayOfMonth)
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

const determineAlertableLastDayOfMonth = (timeSheet: TimeSheet): DayOfWeek | null => {
  const today = getTodayDateOnly()
  const lastDayOfMonth = getLastDayOfMonth(today.month, today.year)

  for (const dayOfWeek of Object.keys(timeSheet.dates) as DayOfWeek[]) {
    const date = timeSheet.dates[dayOfWeek]

    if (!isBusinessDayOfWeek(dayOfWeek)) {
      continue
    }

    if (date.day === lastDayOfMonth) {
      return dayOfWeek
    }
  }

  return null
}

export const summarizeTimeSheet = (timeSheet: TimeSheet): TimeSheetSummary => {
  const alertableLastDayOfMonth = determineAlertableLastDayOfMonth(timeSheet)
  return {
    weekStatus: determineWeekStatusFromTimeCards(timeSheet),
    daysFilled: determineDaysFilledFromTimeCards(timeSheet),
    totalDaysSubmitted: determineTotalDaysSubmittedFromTimeCards(timeSheet),
    totalDaysSaved: determineTotalDaysSavedFromTimeCards(timeSheet),
    timeRemaining: determineTimeRemaining(timeSheet, alertableLastDayOfMonth),
    alertableLastDayOfMonth,
  }
}
