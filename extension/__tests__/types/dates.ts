import { beforeAll, describe, expect, jest, test } from '@jest/globals'
import {
  addDays,
  addMinutes,
  compareDateOnly,
  compareTimeOnly,
  convertInputTimeToTimeOnly,
  convertTimeOnlyToInputTime,
  fromDateOnlyKey,
  getDayOfWeek,
  getDisplayDate,
  getDisplayDayOfWeek,
  getLastDayOfMonth,
  getMondayOfDateOnly,
  getTimeOnly,
  getTodayDateOnly,
  isTimeWithinRange,
  isValidTimeOnlyInput,
  minusDays,
  minusMinutes,
  toDateOnlyKey,
} from '../../src/types/dates'

describe('toDateOnlyKey', () => {
  test('returns the correct padded string', () => {
    expect(toDateOnlyKey({ year: 2021, month: 1, day: 2 })).toBe('01/02/2021')
  })

  test('returns the correct unpadded string', () => {
    expect(toDateOnlyKey({ year: 2022, month: 12, day: 31 })).toBe('12/31/2022')
  })
})

describe('getDisplayDayOfWeek', () => {
  test('returns the correct display value', () => {
    expect(getDisplayDayOfWeek('monday')).toBe('Monday')
    expect(getDisplayDayOfWeek('tuesday')).toBe('Tuesday')
    expect(getDisplayDayOfWeek('wednesday')).toBe('Wednesday')
    expect(getDisplayDayOfWeek('thursday')).toBe('Thursday')
    expect(getDisplayDayOfWeek('friday')).toBe('Friday')
    expect(getDisplayDayOfWeek('saturday')).toBe('Saturday')
    expect(getDisplayDayOfWeek('sunday')).toBe('Sunday')
  })
})

describe('getDisplayDate', () => {
  test('returns the correct display value', () => {
    expect(getDisplayDate({ year: 2021, month: 1, day: 2 })).toBe('1/2/2021')
    expect(getDisplayDate({ year: 2022, month: 12, day: 31 })).toBe('12/31/2022')
  })
})

describe('fromDateOnlyKey', () => {
  test('returns the correct date', () => {
    expect(fromDateOnlyKey('01/02/2021')).toEqual({ year: 2021, month: 1, day: 2 })
  })

  test('throws an error when the date is invalid', () => {
    expect(() => {
      fromDateOnlyKey('01/02')
    }).toThrow()
  })
})

describe('addDays', () => {
  test('wraps to the next month', () => {
    expect(addDays({ year: 2021, month: 1, day: 31 }, 1)).toEqual({ year: 2021, month: 2, day: 1 })
  })

  test('wraps to the next year', () => {
    expect(addDays({ year: 2021, month: 12, day: 31 }, 1)).toEqual({ year: 2022, month: 1, day: 1 })
  })

  test('adds days correctly', () => {
    expect(addDays({ year: 2021, month: 1, day: 1 }, 5)).toEqual({ year: 2021, month: 1, day: 6 })
  })
})

describe('minusDays', () => {
  test('wraps to the previous month', () => {
    expect(minusDays({ year: 2021, month: 2, day: 1 }, 1)).toEqual({ year: 2021, month: 1, day: 31 })
  })

  test('wraps to the previous year', () => {
    expect(minusDays({ year: 2022, month: 1, day: 1 }, 1)).toEqual({ year: 2021, month: 12, day: 31 })
  })

  test('subtracts days correctly', () => {
    expect(minusDays({ year: 2021, month: 1, day: 6 }, 5)).toEqual({ year: 2021, month: 1, day: 1 })
  })
})

describe('minusMinutes', () => {
  test('returns null when the time is before 00:00', () => {
    expect(minusMinutes({ hour: 0, minute: 0 }, 1)).toBeNull()
  })

  test('returns the correct time', () => {
    expect(minusMinutes({ hour: 1, minute: 1 }, 1)).toEqual({ hour: 1, minute: 0 })
  })

  test('wraps to the previous hour', () => {
    expect(minusMinutes({ hour: 1, minute: 0 }, 1)).toEqual({ hour: 0, minute: 59 })
  })

  test('wraps to the second previous hour', () => {
    expect(minusMinutes({ hour: 2, minute: 0 }, 61)).toEqual({ hour: 0, minute: 59 })
  })
})

describe('addMinutes', () => {
  test('returns null when the time is after 23:59', () => {
    expect(addMinutes({ hour: 23, minute: 59 }, 1)).toBeNull()
  })

  test('returns the correct time', () => {
    expect(addMinutes({ hour: 1, minute: 0 }, 1)).toEqual({ hour: 1, minute: 1 })
  })

  test('wraps to the next hour', () => {
    expect(addMinutes({ hour: 1, minute: 59 }, 1)).toEqual({ hour: 2, minute: 0 })
  })

  test('wraps to the second next hour', () => {
    expect(addMinutes({ hour: 0, minute: 59 }, 61)).toEqual({ hour: 2, minute: 0 })
  })
})

describe('compareTimeOnly', () => {
  test('returns 0 when the times are equal', () => {
    expect(compareTimeOnly({ hour: 1, minute: 0 }, { hour: 1, minute: 0 })).toBe(0)
  })

  test('returns -1 when the first time is before the second time (same hour)', () => {
    expect(compareTimeOnly({ hour: 1, minute: 0 }, { hour: 1, minute: 1 })).toBe(-1)
  })

  test('returns -1 when the first time is before the second time (different hours)', () => {
    expect(compareTimeOnly({ hour: 0, minute: 0 }, { hour: 1, minute: 0 })).toBe(-1)
  })

  test('returns 1 when the first time is after the second time (same hour)', () => {
    expect(compareTimeOnly({ hour: 1, minute: 1 }, { hour: 1, minute: 0 })).toBe(1)
  })

  test('returns 1 when the first time is after the second time (different hours)', () => {
    expect(compareTimeOnly({ hour: 1, minute: 0 }, { hour: 0, minute: 0 })).toBe(1)
  })
})

describe('compareDateOnly', () => {
  test('returns 0 when the dates are equal', () => {
    expect(compareDateOnly({ year: 2021, month: 1, day: 1 }, { year: 2021, month: 1, day: 1 })).toBe(0)
  })

  test('returns -1 when the first date is before the second date (same year and month)', () => {
    expect(compareDateOnly({ year: 2021, month: 1, day: 1 }, { year: 2021, month: 1, day: 2 })).toBe(-1)
  })

  test('returns 1 when the first date is after the second date (same year and month)', () => {
    expect(compareDateOnly({ year: 2021, month: 1, day: 2 }, { year: 2021, month: 1, day: 1 })).toBe(1)
  })

  test('returns -1 when the first date is before the second date (same year)', () => {
    expect(compareDateOnly({ year: 2021, month: 1, day: 1 }, { year: 2021, month: 2, day: 1 })).toBe(-1)
  })

  test('returns 1 when the first date is after the second date (same year)', () => {
    expect(compareDateOnly({ year: 2021, month: 2, day: 1 }, { year: 2021, month: 1, day: 1 })).toBe(1)
  })

  test('returns -1 when the first date is before the second date (different years)', () => {
    expect(compareDateOnly({ year: 2021, month: 1, day: 1 }, { year: 2022, month: 1, day: 1 })).toBe(-1)
  })

  test('returns 1 when the first date is after the second date (different years)', () => {
    expect(compareDateOnly({ year: 2022, month: 1, day: 1 }, { year: 2021, month: 1, day: 1 })).toBe(1)
  })
})

describe('isTimeWithinRange', () => {
  test('returns true when all the times are the same', () => {
    expect(isTimeWithinRange({ hour: 1, minute: 0 }, { hour: 1, minute: 0 }, { hour: 1, minute: 0 })).toBe(true)
  })

  test('returns true when the time is within the range', () => {
    expect(isTimeWithinRange({ hour: 1, minute: 0 }, { hour: 0, minute: 0 }, { hour: 2, minute: 0 })).toBe(true)
  })

  test('returns true when the time is equal to the start of the range', () => {
    expect(isTimeWithinRange({ hour: 0, minute: 0 }, { hour: 0, minute: 0 }, { hour: 2, minute: 0 })).toBe(true)
  })

  test('returns true when the time is equal to the end of the range', () => {
    expect(isTimeWithinRange({ hour: 2, minute: 0 }, { hour: 0, minute: 0 }, { hour: 2, minute: 0 })).toBe(true)
  })

  test('returns false when the time is before the start of the range', () => {
    expect(isTimeWithinRange({ hour: 0, minute: 0 }, { hour: 1, minute: 0 }, { hour: 2, minute: 0 })).toBe(false)
  })

  test('returns false when the time is after the end of the range', () => {
    expect(isTimeWithinRange({ hour: 3, minute: 0 }, { hour: 1, minute: 0 }, { hour: 2, minute: 0 })).toBe(false)
  })
})

describe('getTodayDateOnly', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 0, 0, 0))
  })

  test('returns the correct date', () => {
    expect(getTodayDateOnly()).toEqual({ year: 2023, month: 3, day: 19 })
  })
})

describe('getTimeOnly', () => {
  test('returns the correct time', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 1, 23, 0))
    expect(getTimeOnly()).toEqual({ hour: 1, minute: 23 })
  })

  test('midnight', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 0, 0, 0))
    expect(getTimeOnly()).toEqual({ hour: 0, minute: 0 })
  })

  test('noon', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 12, 0, 0))
    expect(getTimeOnly()).toEqual({ hour: 12, minute: 0 })
  })

  test('almost midnight', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 23, 59, 0))
    expect(getTimeOnly()).toEqual({ hour: 23, minute: 59 })
  })
})

describe('getDayOfWeek', () => {
  test('returns the correct day of the week (monday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 20 })).toBe('monday')
  })

  test('returns the correct day of the week (tuesday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 21 })).toBe('tuesday')
  })

  test('returns the correct day of the week (wednesday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 22 })).toBe('wednesday')
  })

  test('returns the correct day of the week (thursday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 23 })).toBe('thursday')
  })

  test('returns the correct day of the week (friday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 24 })).toBe('friday')
  })

  test('returns the correct day of the week (saturday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 25 })).toBe('saturday')
  })

  test('returns the correct day of the week (sunday)', () => {
    expect(getDayOfWeek({ year: 2023, month: 3, day: 26 })).toBe('sunday')
  })
})

describe('getMondayOfDateOnly', () => {
  test('returns the same day if the input is a monday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 20 })).toEqual({ year: 2023, month: 3, day: 20 })
  })

  test('returns the day prior if the input is a tuesday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 21 })).toEqual({ year: 2023, month: 3, day: 20 })
  })

  test('returns two days prior if the input is a wednesday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 22 })).toEqual({ year: 2023, month: 3, day: 20 })
  })

  test('returns three days prior if the input is a thursday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 23 })).toEqual({ year: 2023, month: 3, day: 20 })
  })

  test('returns four days prior if the input is a friday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 24 })).toEqual({ year: 2023, month: 3, day: 20 })
  })

  test('returns five days prior if the input is a saturday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 25 })).toEqual({ year: 2023, month: 3, day: 20 })
  })

  test('returns six days prior if the input is a sunday', () => {
    expect(getMondayOfDateOnly({ year: 2023, month: 3, day: 26 })).toEqual({ year: 2023, month: 3, day: 20 })
  })
})

describe('getLastDayOfMonth', () => {
  test('returns the last day of the month (may 2023)', () => {
    expect(getLastDayOfMonth(5, 2023)).toEqual(31)
  })

  test('returns the last day of the month (june 2023)', () => {
    expect(getLastDayOfMonth(6, 2023)).toEqual(30)
  })

  test('returns the last day of the month (february 2024 leap year)', () => {
    expect(getLastDayOfMonth(2, 2024)).toEqual(29)
  })

  test('returns the last day of the month (february 2023 not leap year)', () => {
    expect(getLastDayOfMonth(2, 2023)).toEqual(28)
  })
})

describe('isValidTimeOnlyInput', () => {
  test('returns true if the input is valid', () => {
    expect(isValidTimeOnlyInput('12:00')).toBe(true)
    expect(isValidTimeOnlyInput('00:00')).toBe(true)
    expect(isValidTimeOnlyInput('23:59')).toBe(true)
    expect(isValidTimeOnlyInput('00:01')).toBe(true)
    expect(isValidTimeOnlyInput('01:00')).toBe(true)
    expect(isValidTimeOnlyInput('01:01')).toBe(true)
  })

  test('returns false if the input is invalid', () => {
    expect(isValidTimeOnlyInput('')).toBe(false)
    expect(isValidTimeOnlyInput('12:')).toBe(false)
    expect(isValidTimeOnlyInput(':00')).toBe(false)
    expect(isValidTimeOnlyInput('12:0')).toBe(false)
    expect(isValidTimeOnlyInput('1:00')).toBe(false)
    expect(isValidTimeOnlyInput('12:000')).toBe(false)
    expect(isValidTimeOnlyInput('120:00')).toBe(false)
    expect(isValidTimeOnlyInput('24:00')).toBe(false)
  })
})

describe('convertInputTimeToTimeOnly', () => {
  test('returns the correct time', () => {
    expect(convertInputTimeToTimeOnly('12:00')).toEqual({
      hour: 12,
      minute: 0,
    })
    expect(convertInputTimeToTimeOnly('00:00')).toEqual({
      hour: 0,
      minute: 0,
    })
    expect(convertInputTimeToTimeOnly('23:59')).toEqual({
      hour: 23,
      minute: 59,
    })
    expect(convertInputTimeToTimeOnly('00:01')).toEqual({
      hour: 0,
      minute: 1,
    })
    expect(convertInputTimeToTimeOnly('01:00')).toEqual({
      hour: 1,
      minute: 0,
    })
    expect(convertInputTimeToTimeOnly('01:01')).toEqual({
      hour: 1,
      minute: 1,
    })
  })

  test('returns null if the input is invalid', () => {
    expect(convertInputTimeToTimeOnly('')).toBe(null)
    expect(convertInputTimeToTimeOnly('12:')).toBe(null)
    expect(convertInputTimeToTimeOnly(':00')).toBe(null)
    expect(convertInputTimeToTimeOnly('12:0')).toBe(null)
    expect(convertInputTimeToTimeOnly('1:00')).toBe(null)
    expect(convertInputTimeToTimeOnly('12:000')).toBe(null)
    expect(convertInputTimeToTimeOnly('120:00')).toBe(null)
    expect(convertInputTimeToTimeOnly('24:00')).toBe(null)
  })
})

describe('convertTimeOnlyToInputTime', () => {
  test('returns the correct time', () => {
    expect(convertTimeOnlyToInputTime({ hour: 12, minute: 0 })).toEqual('12:00')
    expect(convertTimeOnlyToInputTime({ hour: 0, minute: 0 })).toEqual('00:00')
    expect(convertTimeOnlyToInputTime({ hour: 23, minute: 59 })).toEqual('23:59')
    expect(convertTimeOnlyToInputTime({ hour: 0, minute: 1 })).toEqual('00:01')
    expect(convertTimeOnlyToInputTime({ hour: 1, minute: 0 })).toEqual('01:00')
    expect(convertTimeOnlyToInputTime({ hour: 1, minute: 1 })).toEqual('01:01')
  })
})
