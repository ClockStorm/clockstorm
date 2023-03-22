import { ExtensionOptions } from '../types/extension-options'
import { readAsDataUrlAsync } from './uploads'

const getGifSelector = (): HTMLDivElement => document.getElementById('gif-selector') as HTMLDivElement

const getSelectedGifImageElement = (): HTMLImageElement => {
  const gifSelector = getGifSelector()
  return gifSelector.querySelector('.selected') as HTMLImageElement
}

const removeSelectedFromAll = () => {
  const gifSelector = getGifSelector()
  const imageElements = Array.from(gifSelector.querySelectorAll('img')) as HTMLImageElement[]

  for (const imageElement of imageElements) {
    imageElement.classList.remove('selected')
  }
}

const selectGif = (preview: HTMLImageElement) => {
  removeSelectedFromAll()
  preview.classList.add('selected')
}

const createSingleGif = (
  source: string,
  title: string,
  isSelected: boolean,
  isCustomInput: boolean,
): HTMLImageElement => {
  const presetSrc = source

  const presetGif = document.createElement('img') as HTMLImageElement

  if (isSelected) {
    selectGif(presetGif)
  }

  presetGif.src = presetSrc
  presetGif.title = title

  const gifSelector = getGifSelector()
  gifSelector.appendChild(presetGif)

  if (isCustomInput) {
    presetGif.classList.add('custom-input')
  }

  presetGif.onclick = () => {
    selectGif(presetGif)
  }

  return presetGif
}

const createGifUploader = () => {
  const gifSelector = getGifSelector()

  const gifInputLabel = document.createElement('label')
  gifInputLabel.id = 'gif-input-label'

  const gifAddIcon = document.createElement('div')
  gifAddIcon.id = 'gif-input-add-icon'
  gifInputLabel.appendChild(gifAddIcon)

  const gifInput = document.createElement('input')
  gifInput.type = 'file'
  gifInput.id = 'gif-input'
  gifInputLabel.appendChild(gifInput)

  gifSelector.appendChild(gifInputLabel)

  gifInput.addEventListener('change', async () => {
    if (gifInput.files === null || !gifInput.files.length) {
      return
    }

    const dataUrl = await readAsDataUrlAsync(gifInput)

    const gifSelector = getGifSelector()
    const customGifPreview = gifSelector.querySelector('.custom-input') as HTMLImageElement | null

    if (customGifPreview) {
      customGifPreview.src = dataUrl
      customGifPreview.title = gifInput.files[0].name
      selectGif(customGifPreview)
      return
    }

    const newCustomGifPreview = createSingleGif(dataUrl, gifInput.files[0].name, true, true)
    gifSelector.insertBefore(newCustomGifPreview, gifInputLabel)
  })

  return gifInput
}

interface PresetDetailSingle {
  url: string
  title: string
}

const createGifPresets = (extensionOptions: ExtensionOptions) => {
  const presetGifDetails: PresetDetailSingle[] = [
    {
      url: 'gifs/clockstorm.gif',
      title: 'Clock Storm',
    },
    {
      url: 'gifs/rainbow-ball.gif',
      title: 'Rainbow Ball',
    },
    {
      url: 'gifs/three-circles.gif',
      title: 'Three Circles',
    },
    {
      url: 'gifs/spiral.gif',
      title: 'Spiral',
    },
    {
      url: 'gifs/biohazard.gif',
      title: 'Biohazard',
    },
    {
      url: 'gifs/swirl.gif',
      title: 'Swirl',
    },
    {
      url: 'gifs/flames.gif',
      title: 'Flames',
    },
    {
      url: 'gifs/circle.gif',
      title: 'Circle',
    },
    {
      url: 'gifs/spinner.gif',
      title: 'Spinner',
    },
    {
      url: 'gifs/webs.gif',
      title: 'Webs',
    },
    {
      url: 'gifs/disco.gif',
      title: 'Disco',
    },
    {
      url: 'gifs/infinity.gif',
      title: 'Infinity',
    },
    {
      url: 'gifs/snake.gif',
      title: 'Snake',
    },
    {
      url: 'gifs/grid.gif',
      title: 'Grid',
    },
    {
      url: 'gifs/bird.gif',
      title: 'Bird',
    },
    {
      url: 'gifs/water.gif',
      title: 'Water',
    },
    {
      url: 'gifs/orb.gif',
      title: 'Orb',
    },
  ]

  for (const presetGifDetailsSingle of presetGifDetails) {
    createSingleGif(
      presetGifDetailsSingle.url,
      presetGifDetailsSingle.title,
      !extensionOptions.gifDataUrl.startsWith('data:') &&
        extensionOptions.gifDataUrl.endsWith(presetGifDetailsSingle.url),
      false,
    )
  }
}

export const createGifSelector = (extensionOptions: ExtensionOptions) => {
  createGifPresets(extensionOptions)

  if (extensionOptions.gifDataUrl.startsWith('data:')) {
    createSingleGif(extensionOptions.gifDataUrl, `Your Upload`, true, false)
  }

  return createGifUploader()
}

export const getSelectedGifUrl = async (extensionOptions: ExtensionOptions): Promise<string> => {
  let gifDataUrl = extensionOptions.gifDataUrl
  const selectedGifImageElement = getSelectedGifImageElement()

  if (selectedGifImageElement) {
    gifDataUrl = selectedGifImageElement.src
  }

  return gifDataUrl
}
