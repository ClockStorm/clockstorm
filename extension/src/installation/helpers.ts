import { compareDateOnly, DateOnly, getMondayOfDateOnly, getTodayDateOnly, minusDays } from '../types/dates'
import { getInstallationDate } from './storage'

export const getEveryMondaySinceInstallation = async (): Promise<DateOnly[]> => {
  const installationDate = await getInstallationDate()
  const installationWeekMonday = getMondayOfDateOnly(installationDate)

  let dateOnly = getTodayDateOnly()

  const mondays: DateOnly[] = []

  while (compareDateOnly(dateOnly, installationWeekMonday) >= 0) {
    const monday = getMondayOfDateOnly(dateOnly)
    mondays.push(monday)
    dateOnly = minusDays(dateOnly, 7)
  }

  return mondays
}
