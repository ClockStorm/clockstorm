import '@fortawesome/fontawesome-free/scss/brands.scss'
import '@fortawesome/fontawesome-free/scss/fontawesome.scss'
import '@fortawesome/fontawesome-free/scss/regular.scss'
import '@fortawesome/fontawesome-free/scss/solid.scss'
import { ExtensionOptions } from '../types/extension-options'
import {
  createDailyReminderSelectors,
  getDailyReminderSelectedDays,
  getDailyReminderSelectedStartTime,
} from './daily-reminder'
import {
  createEndOfMonthReminderSelectors,
  getEndOfMonthSelectedDueTime,
  getEndOfMonthSelectedStartTime,
} from './end-of-month-reminder'
import {
  createEndOfWeekReminderSelectors,
  getEndOfWeekReminderSelectedDayOfWeek,
  getEndOfWeekReminderSelectedDueTime,
  getEndOfWeekReminderSelectedStartTime,
} from './end-of-week-reminder'
import './extension-options.scss'
import { createGifSelector, getSelectedGifUrl } from './gifs'
import { createSoundSelector, getSelectedSoundUrl } from './sounds'
import { getExtensionOptions } from './storage'
import { createTabs } from './tabs'
import { validator } from './validator'

const main = async () => {
  const form = document.getElementById('options') as HTMLFormElement
  const endOfWeekTimesheetReminder = document.getElementById('end-of-week-timesheet-reminder') as HTMLInputElement
  const dailyTimeEntryReminder = document.getElementById('daily-time-entry-reminder') as HTMLInputElement
  const endOfMonthTimesheetReminder = document.getElementById('end-of-month-timesheet-reminder') as HTMLInputElement
  const versionElement = document.getElementById('version') as HTMLSpanElement

  versionElement.innerText = (window as any)['ClockStormVersion'] as string

  if (!form || !endOfWeekTimesheetReminder || !dailyTimeEntryReminder || !endOfMonthTimesheetReminder) {
    throw new Error('Unable to find options form')
  }

  const extensionOptions = await getExtensionOptions()

  createTabs()
  createGifSelector(extensionOptions)
  await createSoundSelector(extensionOptions)
  createDailyReminderSelectors(extensionOptions)
  createEndOfWeekReminderSelectors(extensionOptions)
  createEndOfMonthReminderSelectors(extensionOptions)

  endOfWeekTimesheetReminder.checked = extensionOptions.endOfWeekTimesheetReminder
  dailyTimeEntryReminder.checked = extensionOptions.dailyTimeEntryReminder
  endOfMonthTimesheetReminder.checked = extensionOptions.endOfMonthTimesheetReminder

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!validator.isValid()) {
      return
    }

    const soundDataUrl = await getSelectedSoundUrl(extensionOptions)
    const gifDataUrl = await getSelectedGifUrl(extensionOptions)

    const newExtensionOptions: ExtensionOptions = {
      soundDataUrl,
      gifDataUrl,
      endOfWeekTimesheetReminder: endOfWeekTimesheetReminder.checked,
      dailyTimeEntryReminder: dailyTimeEntryReminder.checked,
      endOfMonthTimesheetReminder: endOfMonthTimesheetReminder.checked,
      dailyReminderDaysOfWeek: getDailyReminderSelectedDays(),
      dailyReminderStartTime: getDailyReminderSelectedStartTime(),
      endOfWeekReminderDayOfWeek: getEndOfWeekReminderSelectedDayOfWeek(),
      endOfWeekReminderStartTime: getEndOfWeekReminderSelectedStartTime(),
      endOfWeekReminderDueTime: getEndOfWeekReminderSelectedDueTime(),
      endOfMonthReminderStartTime: getEndOfMonthSelectedStartTime(),
      endOfMonthReminderDueTime: getEndOfMonthSelectedDueTime(),
    }

    await chrome.storage.local.set({
      extensionOptions: newExtensionOptions,
    })

    window.close()
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  await main()
})

export {}
