import { convertInputTimeToTimeOnly, convertTimeOnlyToInputTime, DayOfWeek, TimeOnly } from '@src/types/dates'
import { ExtensionOptions } from '@src/types/extension-options'
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
  const startTimeElement = document.getElementById('daily-reminder-start-time') as HTMLInputElement

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

  startTimeElement.value = convertTimeOnlyToInputTime(extensionOptions.dailyReminderStartTime)
}

export const getDailyReminderSelectedDays = (): DayOfWeek[] => {
  const daysElement = document.getElementById('daily-reminder-days') as HTMLDivElement
  const buttons = daysElement.querySelectorAll('button.selected') as NodeListOf<HTMLButtonElement>
  return Array.from(buttons).map((button) => button.getAttribute('data-day-of-week') as DayOfWeek)
}

export const getDailyReminderSelectedStartTime = (): TimeOnly => {
  const timeElement = document.getElementById('daily-reminder-start-time') as HTMLInputElement
  return convertInputTimeToTimeOnly(timeElement.value)
}
