import { animatedIcon } from './background-tasks/animated-icon'
import { executeBackgroundTask } from './background-tasks/background-task'
import { getExtensionOptions } from './extension-options/storage'
import { GIFStream, parseGIF } from './gifs/gifs'
import {
  buildNativeNotificationId,
  checkIfAnyNotificationsMatchId,
  createNativeNotification,
} from './notifications/native'
import { checkAnyTimeSheetNotifications, getAllNotifications } from './notifications/notifications'
import { playAudio, stopAudio } from './offscreen/offscreen'
import { fromDateOnlyKey } from './types/dates'
import { GIF } from './types/gifs'
import { waitFor } from './utils/utils'

let running = false

const main = async () => {
  if (running) {
    return
  }

  running = true

  let lastGifDataUrl: string | null = null
  let gifIsRunning = () => false
  let gifShouldCancel = false
  let gif: GIF | null = null

  let lastSoundDataUrl: string | null = null
  let soundPlayingId = 0

  const nativeNotificationsShowing: { [key: string]: boolean } = {}

  const clearNativeNotificationsShowing = () => {
    for (const key of Object.keys(nativeNotificationsShowing)) {
      nativeNotificationsShowing[key] = false
    }
  }

  let lastClearedTime: number | null = null

  chrome.notifications.onClosed.addListener(() => {
    clearNativeNotificationsShowing()
    lastClearedTime = Date.now()
  })

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await waitFor(50)

    const cancelSound = async () => {
      if (soundPlayingId) {
        await stopAudio(soundPlayingId)
        soundPlayingId = 0
      }
    }

    const cancelGif = async () => {
      if (gifIsRunning()) {
        gifShouldCancel = true
      } else if (gif) {
        await chrome.action.setIcon({ imageData: gif.frameData[0].image })
      }
    }

    let newGifLoaded = false
    const extensionOptions = await getExtensionOptions()
    const allActiveNotifications = await getAllNotifications(extensionOptions)
    const shouldNotify = checkAnyTimeSheetNotifications(allActiveNotifications)

    if (extensionOptions.gifDataUrl !== lastGifDataUrl) {
      lastGifDataUrl = extensionOptions.gifDataUrl
      const response = await fetch(extensionOptions.gifDataUrl)
      const arrayBuffer = await response.arrayBuffer()
      const gifStream = new GIFStream(new Uint8Array(arrayBuffer))
      gif = parseGIF(gifStream)
      newGifLoaded = true
    }

    if (!shouldNotify) {
      await cancelSound()
      await cancelGif()

      for (const [notificationId] of Object.keys(nativeNotificationsShowing)) {
        chrome.notifications.clear(notificationId)
      }

      clearNativeNotificationsShowing()
      continue
    }

    if (newGifLoaded) {
      await cancelGif()
    }

    if (extensionOptions.soundDataUrl !== lastSoundDataUrl) {
      lastSoundDataUrl = extensionOptions.soundDataUrl
      await cancelSound()
    }

    for (const notificationId of Object.keys(nativeNotificationsShowing)) {
      if (!checkIfAnyNotificationsMatchId(allActiveNotifications, notificationId)) {
        chrome.notifications.clear(notificationId)
        lastClearedTime = Date.now()
      }
    }

    if (shouldNotify) {
      if (!gifIsRunning() && gif !== null) {
        gifIsRunning = executeBackgroundTask({
          task: animatedIcon(gif),
          checkCancellationFunction: () => gifShouldCancel,
          onDoneFunction: () => (gifShouldCancel = false),
        })
      }

      if (!soundPlayingId) {
        soundPlayingId = await playAudio(extensionOptions.soundDataUrl, 1)
      }

      for (const [startMondayKey, notifications] of Object.entries(allActiveNotifications)) {
        const startMonday = fromDateOnlyKey(startMondayKey)

        for (const notification of notifications) {
          const notificationId = buildNativeNotificationId(startMonday, notification)
          const notificationIsFirstTime = nativeNotificationsShowing[notificationId] === undefined

          if (!notificationIsFirstTime && lastClearedTime !== null && Date.now() - lastClearedTime < 5 * 60 * 1000) {
            continue
          }

          if (!nativeNotificationsShowing[notificationId]) {
            await createNativeNotification(notificationId, startMonday, notification)
            nativeNotificationsShowing[notificationId] = true
          }
        }
      }
    }
  }
}

main()

chrome.runtime.onStartup.addListener(main)
chrome.runtime.onInstalled.addListener(main)

export {}
