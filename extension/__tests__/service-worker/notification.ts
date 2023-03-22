import { describe, expect, jest, test } from '@jest/globals'
import { TimeSheetDates } from '../../src/types/time-sheet'
import { shouldNotifyUser } from '../../src/service-worker/notifications'
import { getExtensionOptions } from '../../src/extension-options/storage'
import { getTimeSheet } from '../../src/time-sheets/storage'

const dates: TimeSheetDates = {
  monday: {
    year: 2023,
    month: 3,
    day: 13,
  },
  tuesday: {
    year: 2023,
    month: 3,
    day: 14,
  },
  wednesday: {
    year: 2023,
    month: 3,
    day: 15,
  },
  thursday: {
    year: 2023,
    month: 3,
    day: 16,
  },
  friday: {
    year: 2023,
    month: 3,
    day: 17,
  },
  saturday: {
    year: 2023,
    month: 3,
    day: 18,
  },
  sunday: {
    year: 2023,
    month: 3,
    day: 19,
  },
}

jest.mock('../../src/extension-options/storage', () => ({
  getExtensionOptions: jest.fn(),
}))

jest.mock('../../src/time-sheets/storage', () => ({
  getTimeSheet: jest.fn(),
}))

const getExtensionOptionsMock = getExtensionOptions as jest.Mocked<typeof getExtensionOptions>
const getTimeSheetMock = getTimeSheet as jest.Mocked<typeof getTimeSheet>

describe('shouldNotifyUser', () => {
  test('when there are no time cards submitted and it is thursday and the reminder is enabled', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: false,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'saved',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(true)
  })

  test('when there are no time cards submitted and it is thursday but the reminder is off', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: false,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'saved',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(false)
  })

  test('when there is no time entered in previous days and the reminder is enabled', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: true,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'saved',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(true)
  })

  test('when there is time filled in for all days but they are not saved and the reminder is enabled', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: true,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'unsaved',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(true)
  })

  test('when there is time filled in for all days and the time card is submitted and the reminders are enabled', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'submitted',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(false)
  })

  test('when there is time filled in for all days between two time cards but the time cards are not submitted and the reminders are enabled', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'saved',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
          },
        },
        {
          status: 'saved',
          hours: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(true)
  })

  test('when there is time filled in for all days between two time cards and the time cards are submitted and the reminders are enabled', async () => {
    getExtensionOptionsMock.mockResolvedValue({
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      gifDataUrl: '',
      soundDataUrl: '',
    })

    getTimeSheetMock.mockResolvedValue({
      dates,
      timeCards: [
        {
          status: 'submitted',
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
          },
        },
        {
          status: 'submitted',
          hours: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
        },
      ],
    })

    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 0, 0, 0))

    const actual = await shouldNotifyUser()
    expect(actual).toEqual(false)
  })
})
