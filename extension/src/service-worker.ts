import { animatedIcon } from './background-tasks/animated-icon'
import { executeBackgroundTask } from './background-tasks/background-task'
import { getExtensionOptions } from './extension-options/storage'
import { GIFStream, parseGIF } from './gifs/gifs'
import { playAudio, stopAudio } from './offscreen'
import { shouldNotifyUser } from './service-worker/notifications'
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

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await waitFor(50)

    const shouldNotify = await shouldNotifyUser()

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
      continue
    }

    if (newGifLoaded) {
      await cancelGif()
    }

    if (extensionOptions.soundDataUrl !== lastSoundDataUrl) {
      lastSoundDataUrl = extensionOptions.soundDataUrl
      await cancelSound()
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
    }
  }
}

main()

chrome.runtime.onStartup.addListener(main)
chrome.runtime.onInstalled.addListener(main)

export {}
