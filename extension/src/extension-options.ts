import { createGifSelector, getSelectedGifUrl } from './extension-options/gifs'
import { createSoundSelector, getSelectedSoundUrl } from './extension-options/sounds'
import { getExtensionOptions } from './extension-options/storage'

const main = async () => {
  const form = document.getElementById('options') as HTMLFormElement
  const endOfWeekTimesheetReminder = document.getElementById('end-of-week-timesheet-reminder') as HTMLInputElement
  const dailyTimeEntryReminder = document.getElementById('daily-time-entry-reminder') as HTMLInputElement
  const versionElement = document.getElementById('version') as HTMLSpanElement

  versionElement.innerText = (window as any)['ClockStormVersion'] as string

  if (!form || !endOfWeekTimesheetReminder || !dailyTimeEntryReminder) {
    throw new Error('Unable to find options form')
  }

  const extensionOptions = await getExtensionOptions()

  createGifSelector(extensionOptions)
  await createSoundSelector(extensionOptions)

  endOfWeekTimesheetReminder.checked = extensionOptions.endOfWeekTimesheetReminder
  dailyTimeEntryReminder.checked = extensionOptions.dailyTimeEntryReminder

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const soundDataUrl = await getSelectedSoundUrl(extensionOptions)
    const gifDataUrl = await getSelectedGifUrl(extensionOptions)

    await chrome.storage.local.set({
      extensionOptions: {
        soundDataUrl,
        gifDataUrl,
        endOfWeekTimesheetReminder: endOfWeekTimesheetReminder.checked,
        dailyTimeEntryReminder: dailyTimeEntryReminder.checked,
      },
    })

    window.close()
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  await main()
})

export {}
