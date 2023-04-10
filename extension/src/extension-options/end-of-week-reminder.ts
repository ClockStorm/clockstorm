import {
  compareTimeOnly,
  convertInputTimeToTimeOnly,
  convertTimeOnlyToInputTime,
  DayOfWeek,
  TimeOnly,
} from '../types/dates'
import { ExtensionOptions } from '../types/extension-options'
import { validator } from './validator'

export const isValidTimes = (): boolean => {
  const startTimeElement = document.getElementById('end-of-week-start-time') as HTMLInputElement
  const dueTimeElement = document.getElementById('end-of-week-due-time') as HTMLInputElement

  const startTime = convertInputTimeToTimeOnly(startTimeElement.value)
  const dueTime = convertInputTimeToTimeOnly(dueTimeElement.value)

  if (!startTime || !dueTime) {
    return false
  }
  if (compareTimeOnly(dueTime, startTime) <= 0) {
    return false
  }

  return true
}

const validate = () => {
  const errorElement = document.getElementById('end-of-week-error') as HTMLDivElement

  const validTimes = isValidTimes()
  validator.setValid('end-of-week-reminder-times', isValidTimes())

  if (validTimes) {
    errorElement.classList.add('hidden')
  } else {
    errorElement.classList.remove('hidden')
  }
}

export const createEndOfWeekReminderSelectors = (extensionOptions: ExtensionOptions) => {
  const dayOfWeekElement = document.getElementById('end-of-week-day-of-week') as HTMLDivElement
  const dayOfWeekButtons = dayOfWeekElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
  const startTimeElement = document.getElementById('end-of-week-start-time') as HTMLInputElement
  const dueTimeElement = document.getElementById('end-of-week-due-time') as HTMLInputElement

  dayOfWeekButtons.forEach((button) => {
    const buttonDayOfWeek = button.getAttribute('data-day-of-week') as DayOfWeek

    if (extensionOptions.endOfWeekReminderDayOfWeek === buttonDayOfWeek) {
      button.classList.add('selected')
    }

    button.addEventListener('click', (e) => {
      e.preventDefault()
      dayOfWeekButtons.forEach((b) => b.classList.remove('selected'))
      button.classList.add('selected')
    })
  })

  startTimeElement.value = convertTimeOnlyToInputTime(extensionOptions.endOfWeekReminderStartTime)
  dueTimeElement.value = convertTimeOnlyToInputTime(extensionOptions.endOfWeekReminderDueTime)

  startTimeElement.addEventListener('change', validate)
  dueTimeElement.addEventListener('change', validate)
}

export const getEndOfWeekReminderSelectedDayOfWeek = (): DayOfWeek => {
  const dayOfWeekElement = document.getElementById('end-of-week-day-of-week') as HTMLDivElement
  const selectedButton = dayOfWeekElement.querySelector('button.selected') as HTMLButtonElement
  return selectedButton.getAttribute('data-day-of-week') as DayOfWeek
}

export const getEndOfWeekReminderSelectedStartTime = (): TimeOnly => {
  const timeElement = document.getElementById('end-of-week-start-time') as HTMLInputElement
  return convertInputTimeToTimeOnly(timeElement.value)
}

export const getEndOfWeekReminderSelectedDueTime = (): TimeOnly => {
  const timeElement = document.getElementById('end-of-week-due-time') as HTMLInputElement
  return convertInputTimeToTimeOnly(timeElement.value)
}
