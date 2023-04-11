import {
  compareTimeOnly,
  convertInputTimeToTimeOnly,
  convertTimeOnlyToInputTime,
  DayOfWeek,
  TimeOnly,
} from '../types/dates'
import { ExtensionOptions } from '../types/extension-options'
import { createTimePicker } from './time-picker'
import { validator } from './validator'

export const isValidTimes = (): boolean => {
  const startTimeElement = createTimePicker(document.getElementById('end-of-week-start-time') as HTMLDivElement)
  const dueTimeElement = createTimePicker(document.getElementById('end-of-week-due-time') as HTMLDivElement)

  const startTime = convertInputTimeToTimeOnly(startTimeElement.getValue())
  const dueTime = convertInputTimeToTimeOnly(dueTimeElement.getValue())

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
  const startTimeElement = createTimePicker(document.getElementById('end-of-week-start-time') as HTMLDivElement)
  const dueTimeElement = createTimePicker(document.getElementById('end-of-week-due-time') as HTMLDivElement)

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

  startTimeElement.setValue(convertTimeOnlyToInputTime(extensionOptions.endOfWeekReminderStartTime))
  dueTimeElement.setValue(convertTimeOnlyToInputTime(extensionOptions.endOfWeekReminderDueTime))

  startTimeElement.addChangeListener(validate)
  dueTimeElement.addChangeListener(validate)
}

export const getEndOfWeekReminderSelectedDayOfWeek = (): DayOfWeek => {
  const dayOfWeekElement = document.getElementById('end-of-week-day-of-week') as HTMLDivElement
  const selectedButton = dayOfWeekElement.querySelector('button.selected') as HTMLButtonElement
  return selectedButton.getAttribute('data-day-of-week') as DayOfWeek
}

export const getEndOfWeekReminderSelectedStartTime = (): TimeOnly => {
  const timeElement = createTimePicker(document.getElementById('end-of-week-start-time') as HTMLDivElement)
  return convertInputTimeToTimeOnly(timeElement.getValue())
}

export const getEndOfWeekReminderSelectedDueTime = (): TimeOnly => {
  const timeElement = createTimePicker(document.getElementById('end-of-week-due-time') as HTMLDivElement)
  return convertInputTimeToTimeOnly(timeElement.getValue())
}
