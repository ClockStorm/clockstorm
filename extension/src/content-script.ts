import { DataSource } from './data-sources/data-source'
import { lightning } from './data-sources/lightning'
import { toDateOnlyKey } from './types/dates'
import { isTimeSheetEqual, TimeSheet } from './types/time-sheet'
import { doWhile, forever, waitFor } from './utils/utils'

const main = async () => {
  let lastTimeSheetUpdate: TimeSheet | null = null
  const dataSources: DataSource[] = [lightning]

  await doWhile(async () => {
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
  }, forever, () => waitFor(5000))
}

main()

export {}
