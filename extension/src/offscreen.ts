import { Message, PlayAudioMessage, StopAudioMessage } from './types/offscreen'

chrome.runtime.onMessage.addListener(async (rawMessage: any) => {
  const message = Message.parse(rawMessage)

  if (message.type === 'play-audio') {
    await playAudioInternal(message)
  } else if (message.type === 'stop-audio') {
    stopAudioInternal(message)
  } else {
    throw new Error('Unknown message type')
  }
})

interface AudioMap {
  [key: number]: HTMLAudioElement
}

const audioMap: AudioMap = {}

const playAudioInternal = async (message: PlayAudioMessage) => {
  const audio = new Audio(message.source)
  audio.volume = message.volume
  audio.loop = true
  await audio.play()
  audioMap[message.id] = audio
}

const stopAudioInternal = (message: StopAudioMessage) => {
  if (!(message.id in audioMap)) {
    throw new Error('Audio not found in audio map')
  }

  audioMap[message.id].pause()
  delete audioMap[message.id]
}

let nextId = 1

export const playAudio = async (source: string, volume: number): Promise<number> => {
  const id = nextId++
  await createOffscreen()

  const message: PlayAudioMessage = {
    type: 'play-audio',
    source,
    volume,
    id,
  }

  await chrome.runtime.sendMessage(message)
  return id
}

export const stopAudio = async (id: number) => {
  await createOffscreen()

  const message: StopAudioMessage = {
    type: 'stop-audio',
    id,
  }

  await chrome.runtime.sendMessage(message)
}

const createOffscreen = async () => {
  if (await chrome.offscreen.hasDocument()) {
    return
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Reminding our user to clock their time sheet',
  })
}
