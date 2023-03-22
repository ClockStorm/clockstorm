import { z } from 'zod'

export const DateOnly = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
})
export type DateOnly = z.infer<typeof DateOnly>

export const DayOfWeek = z.union([
  z.literal('monday'),
  z.literal('tuesday'),
  z.literal('wednesday'),
  z.literal('thursday'),
  z.literal('friday'),
  z.literal('saturday'),
  z.literal('sunday'),
])
export type DayOfWeek = z.infer<typeof DayOfWeek>

export const toDateOnlyKey = (dateOnly: DateOnly): string => {
  const month = dateOnly.month.toString().padStart(2, '0')
  const day = dateOnly.day.toString().padStart(2, '0')

  return `${month}/${day}/${dateOnly.year}`
}

export const fromDateOnlyKey = (dateOnlyKey: string): DateOnly => {
  const parts = dateOnlyKey.split('/')

  if (parts.length !== 3) {
    throw new Error(`Invalid date-only key: ${dateOnlyKey}`)
  }

  const [month, day, year] = parts

  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
  }
}
const convertDateToDateOnly = (date: Date): DateOnly => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
})

export const addDays = (date: DateOnly, days: number): DateOnly => {
  const newDate = new Date(date.year, date.month - 1, date.day + days)
  return convertDateToDateOnly(newDate)
}

export const minusDays = (date: DateOnly, days: number): DateOnly => {
  const newDate = new Date(date.year, date.month - 1, date.day - days)
  return convertDateToDateOnly(newDate)
}

export const getTodayDateOnly = (): DateOnly => {
  const now = new Date()

  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  return {
    year,
    month,
    day,
  }
}

export const getDayOfWeek = (dateOnly: DateOnly): DayOfWeek => {
  const dateObject = new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day)
  const dayOfWeekIndex = dateObject.getDay()

  const daysOfWeek: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return daysOfWeek[dayOfWeekIndex]
}

export const dayOfWeekIndexes: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
}

export const getMondayOfDateOnly = (dateOnly: DateOnly): DateOnly => {
  const dayOfWeek = getDayOfWeek(dateOnly)
  return minusDays(dateOnly, dayOfWeekIndexes[dayOfWeek])
}

export const isBusinessDayOfWeek = (dayOfWeek: DayOfWeek): boolean => {
  return (
    dayOfWeek === 'monday' ||
    dayOfWeek === 'tuesday' ||
    dayOfWeek === 'wednesday' ||
    dayOfWeek === 'thursday' ||
    dayOfWeek === 'friday'
  )
}

export const getAllDaysPriorInWeek = (
  dayOfWeek: DayOfWeek,
  inclusive: boolean,
  onlyBusinessDays: boolean,
): DayOfWeek[] => {
  const dayOfWeekIndex = dayOfWeekIndexes[dayOfWeek]
  const startIndex = 0
  const endIndex = dayOfWeekIndex + (inclusive ? 1 : 0)

  const daysOfWeek = Object.keys(dayOfWeekIndexes) as DayOfWeek[]
  return daysOfWeek.slice(startIndex, endIndex).filter((singleDayOfWeek) => {
    return !(onlyBusinessDays && !isBusinessDayOfWeek(singleDayOfWeek))
  })
}

export const getLastDayOfMonth = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() + 1, 0)
  return date.getDate()
}
