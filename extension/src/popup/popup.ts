import { getTimeSheet } from '../time-sheets/storage'
import { summarizeTimeSheet } from '../time-sheets/summary'
import { getMondayOfDateOnly, getTodayDateOnly } from '../types/dates'
import { waitFor } from '../utils/utils'
import './popup.scss'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/brands.css'
import '@fortawesome/fontawesome-free/css/solid.css'

const main = async () => {
  const daysSubmittedElement = document.getElementById('timecard-days-submitted') as HTMLSpanElement
  const daysSavedElement = document.getElementById('timecard-days-saved') as HTMLSpanElement
  const timeLeftElement = document.getElementById('timecard-time-left') as HTMLSpanElement
  const loadingElement = document.getElementById('loading') as HTMLDivElement
  const summaryElement = document.getElementById('summary') as HTMLDivElement
  const statusElement = document.querySelector('.clockstorm-popup-flex-container .status') as HTMLDivElement

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await waitFor(1000)
    const today = getTodayDateOnly()
    const monday = getMondayOfDateOnly(today)
    const timeSheet = await getTimeSheet(monday)
    const summary = summarizeTimeSheet(timeSheet)

    daysSubmittedElement.innerHTML = summary.totalDaysSubmitted.toString(10)
    daysSavedElement.innerHTML = summary.totalDaysSaved.toString(10)
    timeLeftElement.innerHTML = summary.timeRemaining

    if (summary.totalDaysSubmitted !== 5 && summary.timeRemaining !== '00:00:00') {
      statusElement.classList.remove('fa-check')
      statusElement.classList.add('fa-triangle-exclamation')
      statusElement.style.color = 'red'
    } else {
      statusElement.classList.remove('fa-triangle-exclamation')
      statusElement.classList.add('fa-check')
      statusElement.style.color = 'green'
    }

    summaryElement.style.display = 'block'
    loadingElement.style.display = 'none'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await main()
})

export {}
