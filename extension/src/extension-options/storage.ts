import { ExtensionOptions } from '../types/extension-options'

export const getExtensionOptions = async (): Promise<ExtensionOptions> => {
  const result = await chrome.storage.local.get(['extensionOptions'])
  const parseResult = ExtensionOptions.safeParse(result.extensionOptions)

  if (parseResult.success) {
    return parseResult.data
  }

  return {
    soundDataUrl: 'sounds/cricket.wav',
    gifDataUrl: 'gifs/clockstorm.gif',
    endOfWeekTimesheetReminder: true,
    dailyTimeEntryReminder: true,
  }
}
