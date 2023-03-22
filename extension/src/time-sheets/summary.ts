import { addDays, DayOfWeek } from '../types/dates'
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

const determineTimeRemaining = (timeSheet: TimeSheet): string => {
  const now = new Date()
  const dueDateOnly = addDays(timeSheet.dates.monday, 3)
  const dueDate = new Date(
    dueDateOnly.year,
    dueDateOnly.month - 1,
    dueDateOnly.day,
    17, // 5pm
    0,
    0,
  )
  const dueDateMillisecondsRemaining = dueDate.getTime() - now.getTime()

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

export const summarizeTimeSheet = (timeSheet: TimeSheet): TimeSheetSummary => {
  return {
    weekStatus: determineWeekStatusFromTimeCards(timeSheet),
    daysFilled: determineDaysFilledFromTimeCards(timeSheet),
    totalDaysSubmitted: determineTotalDaysSubmittedFromTimeCards(timeSheet),
    totalDaysSaved: determineTotalDaysSavedFromTimeCards(timeSheet),
    timeRemaining: determineTimeRemaining(timeSheet),
  }
}
