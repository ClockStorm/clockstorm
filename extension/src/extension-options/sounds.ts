import { ExtensionOptions } from '../types/extension-options'
import { readAsDataUrlAsync } from './uploads'

const getSoundSelector = (): HTMLDivElement => {
  return document.getElementById('sound-selector') as HTMLDivElement
}

const getSelectedSoundThumbnailElement = (): HTMLImageElement => {
  const soundSelector = getSoundSelector()
  const thumbnail = soundSelector.querySelector('.selected') as HTMLImageElement

  if (!thumbnail) {
    throw new Error('No sound selected')
  }

  return thumbnail
}

const removeSelectedFromAll = () => {
  const soundSelector = getSoundSelector()
  const soundThumbnailElements = Array.from(soundSelector.querySelectorAll('img')) as HTMLImageElement[]

  for (const thumbnail of soundThumbnailElements) {
    thumbnail.classList.remove('selected')
  }
}

let soundPreviewAudio: HTMLAudioElement | null = null

const playSoundPreview = async (thumbnail: HTMLImageElement) => {
  if (!soundPreviewAudio) {
    soundPreviewAudio = new Audio()
  }

  soundPreviewAudio.pause()
  soundPreviewAudio.currentTime = 0
  soundPreviewAudio.src = thumbnail.getAttribute('data-sound-src') as string
  soundPreviewAudio.volume = 1
  await soundPreviewAudio.play()
}

const selectSound = async (thumbnail: HTMLImageElement, silent: boolean) => {
  removeSelectedFromAll()
  thumbnail.classList.add('selected')

  if (!silent) {
    await playSoundPreview(thumbnail)
  }
}

const createSingleSound = async (
  source: string,
  thumbnailSource: string,
  title: string,
  isSelected: boolean,
  isCustomInput: boolean,
): Promise<HTMLImageElement> => {
  const presetSoundThumbnail = document.createElement('img') as HTMLImageElement

  presetSoundThumbnail.src = thumbnailSource
  presetSoundThumbnail.setAttribute('data-sound-src', source)
  presetSoundThumbnail.title = title

  if (isSelected) {
    await selectSound(presetSoundThumbnail, true)
  }

  const soundSelector = getSoundSelector()
  soundSelector.appendChild(presetSoundThumbnail)

  if (isCustomInput) {
    presetSoundThumbnail.classList.add('custom-input')
  }

  presetSoundThumbnail.onclick = async () => {
    await selectSound(presetSoundThumbnail, false)
  }

  return presetSoundThumbnail
}

const createSoundUploader = () => {
  const soundSelector = getSoundSelector()

  const soundInputLabel = document.createElement('label')
  soundInputLabel.id = 'sound-input-label'

  const soundAddIcon = document.createElement('div')
  soundAddIcon.id = 'sound-input-add-icon'
  soundInputLabel.appendChild(soundAddIcon)

  const soundInput = document.createElement('input')
  soundInput.type = 'file'
  soundInput.id = 'sound-input'
  soundInputLabel.appendChild(soundInput)

  soundSelector.appendChild(soundInputLabel)

  soundInput.addEventListener('change', async () => {
    if (soundInput.files === null || !soundInput.files.length) {
      return
    }

    const dataUrl = await readAsDataUrlAsync(soundInput)

    const soundSelector = getSoundSelector()
    const customSoundThumbnail = soundSelector.querySelector('.custom-input') as HTMLImageElement | null

    if (customSoundThumbnail) {
      customSoundThumbnail.setAttribute('data-sound-src', dataUrl)
      customSoundThumbnail.title = soundInput.files[0].name
      await selectSound(customSoundThumbnail, true)
      await playSoundPreview(customSoundThumbnail)
      return
    }

    const newCustomSoundThumbnail = await createSingleSound(
      dataUrl,
      'sounds/thumbnail.png',
      soundInput.files[0].name,
      true,
      true,
    )
    soundSelector.insertBefore(newCustomSoundThumbnail, soundInputLabel)
    await playSoundPreview(newCustomSoundThumbnail)
  })

  return soundInput
}

interface PresetDetailSingle {
  url: string
  thumbnailUrl: string
  title: string
}

const createSoundPresets = async (extensionOptions: ExtensionOptions) => {
  const presetSoundDetails: PresetDetailSingle[] = [
    {
      url: 'sounds/cricket.wav',
      thumbnailUrl: 'sounds/thumbnail.png',
      title: 'Cricket',
    },
    {
      url: 'sounds/rooster.wav',
      thumbnailUrl: 'sounds/thumbnail.png',
      title: 'Rooster by InspectorJ',
    },
    {
      url: 'sounds/siren.wav',
      thumbnailUrl: 'sounds/thumbnail.png',
      title: 'Siren by guitarguy1985',
    },
    {
      url: 'sounds/phone.wav',
      thumbnailUrl: 'sounds/thumbnail.png',
      title: 'Phone by infobandit',
    },
    {
      url: 'sounds/microwave.wav',
      thumbnailUrl: 'sounds/thumbnail.png',
      title: 'Microwave by Aidan McArthur',
    },
  ]

  for (const presetSoundDetailsSingle of presetSoundDetails) {
    await createSingleSound(
      presetSoundDetailsSingle.url,
      presetSoundDetailsSingle.thumbnailUrl,
      presetSoundDetailsSingle.title,
      !extensionOptions.soundDataUrl.startsWith('data:') &&
        extensionOptions.soundDataUrl.endsWith(presetSoundDetailsSingle.url),
      false,
    )
  }
}

export const createSoundSelector = async (extensionOptions: ExtensionOptions) => {
  await createSoundPresets(extensionOptions)

  if (extensionOptions.soundDataUrl.startsWith('data:')) {
    await createSingleSound(extensionOptions.soundDataUrl, 'sounds/thumbnail.png', 'Your Upload', true, false)
  }

  return createSoundUploader()
}

export const getSelectedSoundUrl = async (extensionOptions: ExtensionOptions): Promise<string> => {
  let soundDataUrl = extensionOptions.soundDataUrl
  const selectedSoundThumbnailElement = getSelectedSoundThumbnailElement()

  if (selectedSoundThumbnailElement) {
    soundDataUrl = selectedSoundThumbnailElement.getAttribute('data-sound-src') as string
  }

  return soundDataUrl
}
