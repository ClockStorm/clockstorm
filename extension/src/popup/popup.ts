import '@fortawesome/fontawesome-free/scss/brands.scss'
import '@fortawesome/fontawesome-free/scss/fontawesome.scss'
import '@fortawesome/fontawesome-free/scss/solid.scss'
import { getActiveNotificationTypes } from '../notifications/notifications'
import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import { getMondayOfDateOnly, getTodayDateOnly } from '../types/dates'
import { waitFor } from '../utils/utils'
import './popup.scss'

const main = async () => {
  const daysSubmittedElement = document.getElementById('timecard-days-submitted') as HTMLSpanElement
  const daysSavedElement = document.getElementById('timecard-days-saved') as HTMLSpanElement
  const timeLeftElement = document.getElementById('timecard-time-left') as HTMLSpanElement
  const loadingElement = document.getElementById('loading') as HTMLDivElement
  const summaryElement = document.getElementById('summary') as HTMLDivElement
  const activeNotificationsElement = document.getElementById('active-notifications') as HTMLParagraphElement
  const activeNotificationsListElement = document.querySelector('#active-notifications ul') as HTMLUListElement
  const settingsLinkElement = document.getElementById('settings-link') as HTMLAnchorElement

  settingsLinkElement.addEventListener('click', (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const today = getTodayDateOnly()
    const monday = getMondayOfDateOnly(today)
    const timeSheet = await getTimeSheet(monday)
    const summary = summarizeTimeSheet(timeSheet)

    daysSubmittedElement.innerHTML = summary.totalDaysSubmitted.toString(10)
    daysSavedElement.innerHTML = summary.totalDaysSaved.toString(10)
    timeLeftElement.innerHTML = summary.timeRemaining

    const activeNotificationTypes = await getActiveNotificationTypes()

    if (activeNotificationTypes.length > 0) {
      activeNotificationsElement.classList.remove('hidden')
    } else {
      activeNotificationsElement.classList.add('hidden')
    }

    const activeNotificationsListTextPieces = activeNotificationTypes
      .map((type) => {
        switch (type) {
          case 'daily':
            return 'Daily reminder'
          case 'weekly':
            return 'End of week reminder'
          case 'monthly':
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

    await waitFor(1000)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await main()
})

export {}
