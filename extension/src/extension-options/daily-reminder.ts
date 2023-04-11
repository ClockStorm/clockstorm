import { convertInputTimeToTimeOnly, convertTimeOnlyToInputTime, DayOfWeek, TimeOnly } from '../types/dates'
import { ExtensionOptions } from '../types/extension-options'
import { createTimePicker } from './time-picker'
import { validator } from './validator'

const validate = () => {
  const dailyReminderError = document.getElementById('daily-reminder-error') as HTMLDivElement

  const validDays = document.getElementById('daily-reminder-days').querySelectorAll('button.selected').length > 0
  validator.setValid('daily-reminder-days', validDays)

  if (validDays) {
    dailyReminderError.classList.add('hidden')
  } else {
    dailyReminderError.classList.remove('hidden')
  }
}

export const createDailyReminderSelectors = (extensionOptions: ExtensionOptions) => {
  const daysElement = document.getElementById('daily-reminder-days') as HTMLDivElement
  const dayButtons = daysElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
  const startTimeElement = createTimePicker(document.getElementById('daily-reminder-start-time') as HTMLDivElement)

  dayButtons.forEach((button) => {
    const buttonDayOfWeek = button.getAttribute('data-day-of-week') as DayOfWeek

    if (extensionOptions.dailyReminderDaysOfWeek.includes(buttonDayOfWeek)) {
      button.classList.add('selected')
    }

    button.addEventListener('click', (e) => {
      e.preventDefault()
      button.classList.toggle('selected')
      validate()
    })
  })

  startTimeElement.setValue(convertTimeOnlyToInputTime(extensionOptions.dailyReminderStartTime))
}

export const getDailyReminderSelectedDays = (): DayOfWeek[] => {
  const daysElement = document.getElementById('daily-reminder-days') as HTMLDivElement
  const buttons = daysElement.querySelectorAll('button.selected') as NodeListOf<HTMLButtonElement>
  return Array.from(buttons).map((button) => button.getAttribute('data-day-of-week') as DayOfWeek)
}

export const getDailyReminderSelectedStartTime = (): TimeOnly => {
  const timeElement = createTimePicker(document.getElementById('daily-reminder-start-time') as HTMLDivElement)
  return convertInputTimeToTimeOnly(timeElement.getValue())
}
