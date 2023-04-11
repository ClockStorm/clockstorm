import { DateOnly, getTodayDateOnly } from '../types/dates'

const installationDateKey = 'installationDate'

const setInstallationDate = async (date: DateOnly): Promise<void> => {
  const data: { [key: string]: any } = {}
  data[installationDateKey] = date
  await chrome.storage.local.set(data)
}

export const getInstallationDate = async (): Promise<DateOnly> => {
  const result = await chrome.storage.local.get([installationDateKey])

  const fallback = async (): Promise<DateOnly> => {
    const today = getTodayDateOnly()
    await setInstallationDate(today)
    return today
  }

  if (!result[installationDateKey]) {
    return await fallback()
  }

  const parseResult = DateOnly.safeParse(result[installationDateKey])

  if (parseResult.success) {
    return parseResult.data
  }

  return await fallback()
}
