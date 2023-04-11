import { compareTimeOnly, convertInputTimeToTimeOnly, convertTimeOnlyToInputTime, TimeOnly } from '@src/types/dates'
import { ExtensionOptions } from '@src/types/extension-options'
import { validator } from './validator'

export const isValidTimes = (): boolean => {
  const startTimeElement = document.getElementById('end-of-month-start-time') as HTMLInputElement
  const dueTimeElement = document.getElementById('end-of-month-due-time') as HTMLInputElement

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
  const errorElement = document.getElementById('end-of-month-error') as HTMLDivElement

  const validTimes = isValidTimes()
  validator.setValid('end-of-month-reminder-times', isValidTimes())

  if (validTimes) {
    errorElement.classList.add('hidden')
  } else {
    errorElement.classList.remove('hidden')
  }
}

export const createEndOfMonthReminderSelectors = (extensionOptions: ExtensionOptions) => {
  const startTimeElement = document.getElementById('end-of-month-start-time') as HTMLInputElement
  const dueTimeElement = document.getElementById('end-of-month-due-time') as HTMLInputElement

  startTimeElement.value = convertTimeOnlyToInputTime(extensionOptions.endOfMonthReminderStartTime)
  dueTimeElement.value = convertTimeOnlyToInputTime(extensionOptions.endOfMonthReminderDueTime)

  startTimeElement.addEventListener('change', validate)
  dueTimeElement.addEventListener('change', validate)
}

export const getEndOfMonthSelectedStartTime = (): TimeOnly => {
  const timeElement = document.getElementById('end-of-month-start-time') as HTMLInputElement
  return convertInputTimeToTimeOnly(timeElement.value)
}

export const getEndOfMonthSelectedDueTime = (): TimeOnly => {
  const timeElement = document.getElementById('end-of-month-due-time') as HTMLInputElement
  return convertInputTimeToTimeOnly(timeElement.value)
}
