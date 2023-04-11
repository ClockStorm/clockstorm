import { compareTimeOnly, convertInputTimeToTimeOnly, convertTimeOnlyToInputTime, TimeOnly } from '@src/types/dates'
import { ExtensionOptions } from '@src/types/extension-options'
import { createTimePicker } from './time-picker'
import { validator } from './validator'

export const isValidTimes = (): boolean => {
  const startTimeElement = createTimePicker(document.getElementById('end-of-month-start-time') as HTMLDivElement)
  const dueTimeElement = createTimePicker(document.getElementById('end-of-month-due-time') as HTMLDivElement)

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
  const startTimeElement = createTimePicker(document.getElementById('end-of-month-start-time') as HTMLDivElement)
  const dueTimeElement = createTimePicker(document.getElementById('end-of-month-due-time') as HTMLDivElement)

  startTimeElement.setValue(convertTimeOnlyToInputTime(extensionOptions.endOfMonthReminderStartTime))
  dueTimeElement.setValue(convertTimeOnlyToInputTime(extensionOptions.endOfMonthReminderDueTime))

  startTimeElement.addChangeListener(validate)
  dueTimeElement.addChangeListener(validate)
}

export const getEndOfMonthSelectedStartTime = (): TimeOnly => {
  const timeElement = createTimePicker(document.getElementById('end-of-month-start-time') as HTMLDivElement)
  return convertInputTimeToTimeOnly(timeElement.getValue())
}

export const getEndOfMonthSelectedDueTime = (): TimeOnly => {
  const timeElement = createTimePicker(document.getElementById('end-of-month-due-time') as HTMLDivElement)
  return convertInputTimeToTimeOnly(timeElement.getValue())
}
