import { ExtensionOptions } from '../types/extension-options'

export const getExtensionOptions = async (): Promise<ExtensionOptions> => {
  const result = await chrome.storage.local.get(['extensionOptions'])

  if (!result.extensionOptions) {
    return ExtensionOptions.parse({})
  }

  const parseResult = ExtensionOptions.safeParse(result.extensionOptions)

  if (parseResult.success) {
    return parseResult.data
  }

  return ExtensionOptions.parse({})
}
