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

export const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const getDisplayDayOfWeek = (dayOfWeek: DayOfWeek): string => {
  switch (dayOfWeek) {
    case 'monday':
      return 'Monday'
    case 'tuesday':
      return 'Tuesday'
    case 'wednesday':
      return 'Wednesday'
    case 'thursday':
      return 'Thursday'
    case 'friday':
      return 'Friday'
    case 'saturday':
      return 'Saturday'
    case 'sunday':
      return 'Sunday'
  }
}

export const getDisplayDate = (dateOnly: DateOnly): string => {
  return `${dateOnly.month}/${dateOnly.day}/${dateOnly.year}`
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

export const TimeOnly = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
})
export type TimeOnly = z.infer<typeof TimeOnly>

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

export const minusMinutes = (time: TimeOnly, minutes: number): TimeOnly | null => {
  let newMinute = time.minute - minutes
  let newHour = time.hour

  while (newMinute < 0) {
    newHour -= 1
    newMinute += 60

    if (newHour < 0) {
      return null
    }
  }

  return {
    hour: newHour,
    minute: newMinute,
  }
}

export const addMinutes = (time: TimeOnly, minutes: number): TimeOnly | null => {
  let newMinute = time.minute + minutes
  let newHour = time.hour

  while (newMinute >= 60) {
    newHour += 1
    newMinute -= 60

    if (newHour >= 24) {
      return null
    }
  }

  return {
    hour: newHour,
    minute: newMinute,
  }
}

export const compareTimeOnly = (time1: TimeOnly, time2: TimeOnly): number => {
  if (time1.hour < time2.hour) {
    return -1
  }

  if (time1.hour > time2.hour) {
    return 1
  }

  if (time1.minute < time2.minute) {
    return -1
  }

  if (time1.minute > time2.minute) {
    return 1
  }

  return 0
}

export const compareDateOnly = (date1: DateOnly, date2: DateOnly): number => {
  if (date1.year < date2.year) {
    return -1
  }

  if (date1.year > date2.year) {
    return 1
  }

  if (date1.month < date2.month) {
    return -1
  }

  if (date1.month > date2.month) {
    return 1
  }

  if (date1.day < date2.day) {
    return -1
  }

  if (date1.day > date2.day) {
    return 1
  }

  return 0
}

export const isTimeWithinRange = (time: TimeOnly, start: TimeOnly, end: TimeOnly): boolean => {
  return compareTimeOnly(time, start) >= 0 && compareTimeOnly(time, end) <= 0
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

export const getTimeOnly = (): TimeOnly => {
  const now = new Date()
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
  }
}

export const getDayOfWeekFromDate = (date: Date): DayOfWeek => {
  const dayOfWeekMapConversion: { [key: number]: number } = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  }

  return daysOfWeek[dayOfWeekMapConversion[date.getDay()]]
}

export const getDayOfWeek = (dateOnly: DateOnly): DayOfWeek => {
  const dateObject = new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day)
  return getDayOfWeekFromDate(dateObject)
}

export const getMondayOfDateOnly = (dateOnly: DateOnly): DateOnly => {
  const dayOfWeek = getDayOfWeek(dateOnly)
  return minusDays(dateOnly, dayOfWeekIndexes[dayOfWeek])
}

export const getLastDayOfMonth = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() + 1, 0)
  return date.getDate()
}

export const isValidTimeOnlyInput = (inputTime: string): boolean => {
  return (
    !!inputTime &&
    /^(00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23):[0-5][0-9]$/.test(inputTime)
  )
}

export const convertInputTimeToTimeOnly = (inputTime: string): TimeOnly | null => {
  if (!isValidTimeOnlyInput(inputTime)) {
    return null
  }

  const [hour, minute] = inputTime.split(':').map((s) => parseInt(s, 10))
  return {
    hour,
    minute,
  }
}

export const convertTimeOnlyToInputTime = (timeOnly: TimeOnly): string => {
  return `${timeOnly.hour.toString(10).padStart(2, '0')}:${timeOnly.minute.toString(10).padStart(2, '0')}`
}
