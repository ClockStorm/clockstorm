import { getTimeSheet } from './time-sheets/storage'
import { summarizeTimeSheet } from './time-sheets/summary'
import { getMondayOfDateOnly, getTodayDateOnly } from './types/dates'
import { waitFor } from './utils/utils'

const main = async () => {
  const daysSubmittedElement = document.getElementById('timecard-days-submitted') as HTMLSpanElement
  const daysSavedElement = document.getElementById('timecard-days-saved') as HTMLSpanElement
  const timeLeftElement = document.getElementById('timecard-time-left') as HTMLSpanElement
  const loadingElement = document.getElementById('loading') as HTMLDivElement
  const statusElement = document.getElementById('status') as HTMLDivElement

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

    statusElement.style.display = 'block'
    loadingElement.style.display = 'none'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await main()
})

export {}
