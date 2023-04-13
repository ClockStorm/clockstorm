import '@fortawesome/fontawesome-free/scss/brands.scss'
import '@fortawesome/fontawesome-free/scss/fontawesome.scss'
import '@fortawesome/fontawesome-free/scss/solid.scss'
import { getEveryMondaySinceInstallation } from '@src/installation/helpers'
import { CancelSetIntervalAsyncFn, setIntervalAsync } from '../background-tasks/background-task'
import { getExtensionOptions } from '../extension-options/storage'
import { getTimeSheetNotifications } from '../notifications/notifications'
import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import { DateOnly, addDays, compareDateOnly, getDisplayDayOfWeek } from '../types/dates'
import { checkShouldIndicatePreviousOrNextWeekReminders } from './indicators'
import './popup.scss'

const main = async () => {
  const daysSubmittedElement = document.getElementById('timecard-days-submitted') as HTMLSpanElement
  const daysSavedElement = document.getElementById('timecard-days-saved') as HTMLSpanElement
  const timeLeftWrapperElement = document.getElementById('timecard-time-left-wrapper') as HTMLDivElement
  const timeLeftElement = document.getElementById('timecard-time-left') as HTMLSpanElement
  const loadingElement = document.getElementById('loading') as HTMLDivElement
  const summaryElement = document.getElementById('summary') as HTMLDivElement
  const activeNotificationsElement = document.getElementById('active-notifications') as HTMLParagraphElement
  const activeNotificationsListElement = document.querySelector('#active-notifications ul') as HTMLUListElement
  const settingsLinkElement = document.getElementById('settings-link') as HTMLAnchorElement
  const dateSelector = document.getElementById('week-selector') as HTMLDivElement
  const dateSelectorDateElement = dateSelector.querySelector('#week-selector-date') as HTMLSpanElement
  const previousButtonElement = dateSelector.querySelector('a[data-week-direction="previous"]') as HTMLButtonElement
  const nextButtonElement = dateSelector.querySelector('a[data-week-direction="next"]') as HTMLButtonElement

  settingsLinkElement.addEventListener('click', (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })

  const initialMondays = await getEveryMondaySinceInstallation()
  let currentMonday: DateOnly = initialMondays[0]

  const getCurrentMondayIndex = (mondays: DateOnly[]): number => {
    const currentMondayIndex = mondays.findIndex((monday) => compareDateOnly(monday, currentMonday) === 0)

    if (currentMondayIndex === -1) {
      throw new Error('Current Monday not found in list of mondays')
    }

    return currentMondayIndex
  }

  const updateUI = async () => {
    const extensionOptions = await getExtensionOptions()
    const mondays = await getEveryMondaySinceInstallation()
    const currentMondayIndex = getCurrentMondayIndex(mondays)

    if (currentMondayIndex === 0) {
      timeLeftWrapperElement.classList.remove('hidden')
    } else {
      timeLeftWrapperElement.classList.add('hidden')
    }

    if (currentMondayIndex === 0) {
      nextButtonElement.classList.add('disabled')
    } else {
      nextButtonElement.classList.remove('disabled')

      // Check if the next weeks have any active alerts
      const shouldIndicateNext = await checkShouldIndicatePreviousOrNextWeekReminders(
        mondays,
        currentMondayIndex,
        'next',
        extensionOptions,
      )

      if (shouldIndicateNext) {
        nextButtonElement.classList.add('has-notification')
      } else {
        nextButtonElement.classList.remove('has-notification')
      }
    }

    if (currentMondayIndex === mondays.length - 1) {
      previousButtonElement.classList.add('disabled')
    } else {
      previousButtonElement.classList.remove('disabled')

      // Check if the previous weeks have any active alerts
      const shouldIndicatePrevious = await checkShouldIndicatePreviousOrNextWeekReminders(
        mondays,
        currentMondayIndex,
        'previous',
        extensionOptions,
      )

      if (shouldIndicatePrevious) {
        previousButtonElement.classList.add('has-notification')
      } else {
        previousButtonElement.classList.remove('has-notification')
      }
    }

    const monday = mondays[currentMondayIndex]
    const sunday = addDays(monday, 6)
    dateSelectorDateElement.innerText = `${monday.month}/${monday.day}/${monday.year} to ${sunday.month}/${sunday.day}/${sunday.year}`
    const timeSheet = await getTimeSheet(monday)
    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    daysSubmittedElement.innerHTML = summary.totalDaysSubmitted.toString(10)
    daysSavedElement.innerHTML = summary.totalDaysSaved.toString(10)
    timeLeftElement.innerHTML = summary.timeRemaining

    const activeNotificationTypes = await getTimeSheetNotifications(timeSheet, summary, extensionOptions)

    if (activeNotificationTypes.length > 0) {
      activeNotificationsElement.classList.remove('hidden')
    } else {
      activeNotificationsElement.classList.add('hidden')
    }

    const activeNotificationsListTextPieces = activeNotificationTypes
      .map((type) => {
        switch (type.type) {
          case 'daily':
            return `Daily reminder (${getDisplayDayOfWeek(type.dayOfWeek)})`
          case 'end-of-week':
            return 'End of week reminder'
          case 'end-of-month':
            return 'End of month reminder'
          default:
            return null
        }
      })
      .filter((text) => text !== null)

    activeNotificationsListElement.innerHTML = ''
    for (const textPiece of activeNotificationsListTextPieces) {
      const listItemElement = document.createElement('li')
      listItemElement.innerText = textPiece
      activeNotificationsListElement.appendChild(listItemElement)
    }

    summaryElement.classList.remove('hidden')
    loadingElement.classList.add('hidden')
  }

  let stopAutoRefresh: CancelSetIntervalAsyncFn | null = null

  const manualUpdateUI = async () => {
    if (stopAutoRefresh !== null) {
      stopAutoRefresh()
      stopAutoRefresh = null
    }

    await updateUI()

    stopAutoRefresh = setIntervalAsync(async () => {
      await updateUI()
      return true
    }, 1000)
  }

  previousButtonElement.addEventListener('click', async (e) => {
    e.preventDefault()
    const mondays = await getEveryMondaySinceInstallation()
    let currentMondayIndex = getCurrentMondayIndex(mondays)
    currentMondayIndex++

    if (currentMondayIndex >= mondays.length) {
      currentMondayIndex = mondays.length - 1
    }

    currentMonday = mondays[currentMondayIndex]
    await manualUpdateUI()
  })

  nextButtonElement.addEventListener('click', async (e) => {
    e.preventDefault()
    const mondays = await getEveryMondaySinceInstallation()
    let currentMondayIndex = getCurrentMondayIndex(mondays)
    currentMondayIndex--

    if (currentMondayIndex < 0) {
      currentMondayIndex = 0
    }

    currentMonday = mondays[currentMondayIndex]
    await manualUpdateUI()
  })

  await manualUpdateUI()
}

document.addEventListener('DOMContentLoaded', async () => {
  await main()
})

export {}
