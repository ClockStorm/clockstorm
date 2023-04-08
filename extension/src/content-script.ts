import { DataSource } from './types/data-source'
import { lightning } from './data-sources/lightning'
import { toDateOnlyKey } from './types/dates'
import { isTimeSheetEqual, TimeSheet } from './types/time-sheet'
import { waitFor } from './utils/utils'

const main = async () => {
  let lastTimeSheetUpdate: TimeSheet | null = null
  const dataSources: DataSource[] = [lightning]
  let isFirstIteration = true

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!isFirstIteration) {
      await waitFor(5000)
    }

    isFirstIteration = false

    // If we are on the Clock Storm website, add a class to the body element to indicate that the extension is active.
    const clockStormBody = document.querySelector('body[data-clockstorm]')

    if (clockStormBody) {
      clockStormBody.classList.add('clockstorm-active')
    }

    for (const dataSource of dataSources) {
      const timeSheet = await dataSource.queryTimeSheet()

      if (!timeSheet) {
        console.log('No update to send')
        continue
      }

      if (lastTimeSheetUpdate && isTimeSheetEqual(timeSheet, lastTimeSheetUpdate)) {
        console.log('No delta in timesheet')
        continue
      }

      lastTimeSheetUpdate = timeSheet

      console.log('Sending update', timeSheet)

      const data: { [key: string]: TimeSheet } = {}
      data[`timesheet-${toDateOnlyKey(timeSheet.dates.monday)}`] = timeSheet
      await chrome.storage.local.set(data)
    }
  }
}

main()

export {}
