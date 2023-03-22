import { DateOnly, fromDateOnlyKey, minusDays } from '../types/dates'
import { TimeCard, TimeCardStatus, TimeSheet } from '../types/time-sheet'
import { DataSource } from './data-source'

const getWeekEnding = (): DateOnly | null => {
  const weekEndingElement = document.querySelector('[data-ffid="weekEnding"] input') as HTMLInputElement

  if (weekEndingElement === null || !weekEndingElement.value || weekEndingElement.value.trim() === '') {
    return null
  }

  return fromDateOnlyKey(weekEndingElement.value)
}

export const queryTimeSheet = async (): Promise<TimeSheet | null> => {
  const timeSheetElement = document.querySelector('[data-ffid="TimecardGrid"]')
  if (timeSheetElement === null) {
    return null
  }

  const timeCardElements = timeSheetElement.getElementsByTagName('table')

  const timeCards: TimeCard[] = []

  for (const [_, timeCardElement] of Array.from(timeCardElements).entries()) {
    const projectName = getProjectName(timeCardElement)
    if (projectName === null) {
      continue
    }
    const status = getStatus(timeCardElement)

    if (status === null) {
      continue
    }

    timeCards.push({
      hours: {
        monday: getDayHours(timeCardElement, 1),
        tuesday: getDayHours(timeCardElement, 2),
        wednesday: getDayHours(timeCardElement, 3),
        thursday: getDayHours(timeCardElement, 4),
        friday: getDayHours(timeCardElement, 5),
        saturday: getDayHours(timeCardElement, 6),
        sunday: getDayHours(timeCardElement, 7),
      },
      status,
    })
  }

  const weekEnding = getWeekEnding()

  if (!weekEnding) {
    return null
  }

  return {
    dates: {
      monday: minusDays(weekEnding, 6),
      tuesday: minusDays(weekEnding, 5),
      wednesday: minusDays(weekEnding, 4),
      thursday: minusDays(weekEnding, 3),
      friday: minusDays(weekEnding, 2),
      saturday: minusDays(weekEnding, 1),
      sunday: minusDays(weekEnding, 0),
    },
    timeCards,
  }
}

const getProjectName = (timeCardElement: HTMLElement): string | null => {
  const columns = timeCardElement.getElementsByTagName('td')

  if (columns.length === 0) {
    return null
  }

  const inputElement = columns[1].querySelector('input')
  if (inputElement === null) {
    return null
  }

  const projectName = inputElement.value.trim()

  if (projectName === '') {
    return null
  }

  return projectName
}

const getStatus = (timeCardElement: HTMLElement): TimeCardStatus | null => {
  const statusElement = timeCardElement.querySelector('[data-columnid="statusId"]') as HTMLElement

  if (statusElement === null) {
    return null
  }

  const status = statusElement.innerText.trim().toLocaleLowerCase()

  if (status !== 'submitted' && status !== 'saved' && status !== 'unsaved' && status !== 'approved') {
    return null
  }

  return status
}

const getDayHours = (timecardElement: HTMLElement, dayNumber: number): number => {
  const column = timecardElement.querySelector(`[data-columnid="weekDay${dayNumber}"]`) as HTMLElement

  if (column === null) {
    console.warn(`Could not find column for day ${dayNumber}`)
    return 0
  }

  let hours = 0

  try {
    hours = parseFloat(column.innerText)
    if (isNaN(hours)) {
      hours = 0
    }
  } catch (e) {
    hours = 0
  }

  return hours
}

export const lightning: DataSource = {
  queryTimeSheet,
}
