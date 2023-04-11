import { describe, expect, jest, test } from '@jest/globals'
import { checkShouldNotify, getActiveNotificationTypes } from '../../src/notifications/notifications'
import { summarizeTimeSheet } from '../../src/time-sheets/summary'
import { DateOnly } from '../../src/types/dates'
import { ExtensionOptions } from '../../src/types/extension-options'
import { TimeSheet, TimeSheetDates } from '../../src/types/time-sheet'
import { createMockLocalStorage, installMockLocalStorage } from '../mocks/mock.chrome-local-storage'

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

const endOfMonthDates: TimeSheetDates = {
  monday: {
    year: 2023,
    month: 5,
    day: 29,
  },
  tuesday: {
    year: 2023,
    month: 5,
    day: 30,
  },
  wednesday: {
    year: 2023,
    month: 5,
    day: 31,
  },
  thursday: {
    year: 2023,
    month: 6,
    day: 1,
  },
  friday: {
    year: 2023,
    month: 6,
    day: 2,
  },
  saturday: {
    year: 2023,
    month: 6,
    day: 3,
  },
  sunday: {
    year: 2023,
    month: 6,
    day: 4,
  },
}

const defaultExtensionOptions: ExtensionOptions = {
  dailyTimeEntryReminder: true,
  endOfMonthTimesheetReminder: true,
  endOfWeekTimesheetReminder: true,
  gifDataUrl: 'gifs/clockstorm.gif',
  soundDataUrl: 'sounds/cricket.wav',
  dailyReminderDaysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  dailyReminderStartTime: {
    hour: 9,
    minute: 0,
  },
  endOfWeekReminderDayOfWeek: 'thursday',
  endOfWeekReminderStartTime: {
    hour: 9,
    minute: 0,
  },
  endOfWeekReminderDueTime: {
    hour: 17,
    minute: 0,
  },
  endOfMonthReminderStartTime: {
    hour: 9,
    minute: 0,
  },
  endOfMonthReminderDueTime: {
    hour: 17,
    minute: 0,
  },
}

describe('getActiveNotificationTypes', () => {
  test('when there are no time cards submitted and it is thursday and the reminder is enabled', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 9, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: false,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([
      {
        type: 'end-of-week',
      },
    ])
  })

  test('when there are no time cards submitted and it is thursday but the reminder is off', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 0, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: false,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)
    expect(actual).toEqual([])
  })

  test('when there is no time entered in previous days and the reminder is enabled', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 9, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: true,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([
      {
        type: 'daily',
        dayOfWeek: 'wednesday',
      },
      {
        type: 'daily',
        dayOfWeek: 'thursday',
      },
    ])
  })

  test('when there is time filled in for all days but they are not saved and the reminder is enabled', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 9, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: true,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([
      {
        type: 'daily',
        dayOfWeek: 'monday',
      },
      {
        type: 'daily',
        dayOfWeek: 'tuesday',
      },
      {
        type: 'daily',
        dayOfWeek: 'wednesday',
      },
      {
        type: 'daily',
        dayOfWeek: 'thursday',
      },
      {
        type: 'daily',
        dayOfWeek: 'friday',
      },
    ])
  })

  test('when there is time filled in for all days and the time card is submitted and the reminders are enabled', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 0, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)
    expect(actual).toEqual([])
  })

  test('when there is time filled in for all days between two time cards but the time cards are not submitted and the reminders are enabled', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 9, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)
    expect(actual).toEqual([
      {
        type: 'end-of-week',
      },
    ])
  })

  test('when there is time filled in for all days between two time cards and the time cards are submitted and the reminders are enabled', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 17, 0, 0, 0))

    const timeSheet: TimeSheet = {
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
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      endOfMonthTimesheetReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)
    expect(actual).toEqual([])
  })

  test('when the last day of the month is in the middle of the week', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 31, 9, 0, 0))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
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
      ],
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: false,
      dailyTimeEntryReminder: false,
      endOfMonthTimesheetReminder: true,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)
    expect(actual).toEqual([
      {
        type: 'end-of-month',
      },
    ])
  })

  test('when the user has no days clocked at the end of the week', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 5, 2, 9, 0, 0))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
      timeCards: [],
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfWeekTimesheetReminder: true,
      dailyTimeEntryReminder: true,
      endOfMonthTimesheetReminder: true,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([
      {
        type: 'daily',
        dayOfWeek: 'monday',
      },
      {
        type: 'daily',
        dayOfWeek: 'tuesday',
      },
      {
        type: 'daily',
        dayOfWeek: 'wednesday',
      },
      {
        type: 'daily',
        dayOfWeek: 'thursday',
      },
      {
        type: 'daily',
        dayOfWeek: 'friday',
      },
      {
        type: 'end-of-week',
      },
      {
        type: 'end-of-month',
      },
    ])
  })

  test('when the daily reminder is enabled but it is right before the start time', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 13, 8, 59, 0))

    const timeSheet: TimeSheet = {
      dates,
      timeCards: [],
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      dailyTimeEntryReminder: true,
      dailyReminderStartTime: {
        hour: 9,
        minute: 0,
      },
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([])
  })

  test('end of month all submitted or approved', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 31, 9, 0, 0))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
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
      ],
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfMonthTimesheetReminder: true,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([])
  })

  test('end of month not yet past start time', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 31, 8, 59, 0))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
      timeCards: [],
    }

    const extensionOptions: ExtensionOptions = {
      ...defaultExtensionOptions,
      endOfMonthTimesheetReminder: true,
      endOfMonthReminderStartTime: {
        hour: 9,
        minute: 0,
      },
      dailyTimeEntryReminder: false,
    }

    const summary = summarizeTimeSheet(timeSheet, extensionOptions)

    const actual = await getActiveNotificationTypes(timeSheet, summary, extensionOptions)

    expect(actual).toEqual([])
  })
})

const mockStorage = createMockLocalStorage()
installMockLocalStorage(mockStorage)

describe('checkShouldNotify', () => {
  test('returns true when any week since installation date has notifications', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 11, 17, 0, 0))

    const installationDate: DateOnly = {
      year: 2023,
      month: 5,
      day: 1,
    }

    const installWeekSheet: TimeSheet = {
      dates: {
        monday: {
          year: 2023,
          month: 5,
          day: 1,
        },
        tuesday: {
          year: 2023,
          month: 5,
          day: 2,
        },
        wednesday: {
          year: 2023,
          month: 5,
          day: 3,
        },
        thursday: {
          year: 2023,
          month: 5,
          day: 4,
        },
        friday: {
          year: 2023,
          month: 5,
          day: 5,
        },
        saturday: {
          year: 2023,
          month: 5,
          day: 6,
        },
        sunday: {
          year: 2023,
          month: 5,
          day: 7,
        },
      },
      timeCards: [],
    }

    const currentWeekSheet: TimeSheet = {
      dates: {
        monday: {
          year: 2023,
          month: 5,
          day: 8,
        },
        tuesday: {
          year: 2023,
          month: 5,
          day: 9,
        },
        wednesday: {
          year: 2023,
          month: 5,
          day: 10,
        },
        thursday: {
          year: 2023,
          month: 5,
          day: 11,
        },
        friday: {
          year: 2023,
          month: 5,
          day: 12,
        },
        saturday: {
          year: 2023,
          month: 5,
          day: 13,
        },
        sunday: {
          year: 2023,
          month: 5,
          day: 14,
        },
      },
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
    }

    await mockStorage.set({
      installationDate,
      'timesheet-05/01/2023': installWeekSheet,
      'timesheet-05/08/2023': currentWeekSheet,
    })

    const actual = await checkShouldNotify(defaultExtensionOptions)
    expect(actual).toBe(true)
  })

  test('returns false when all week since installation date have no notifications', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 11, 17, 0, 0))

    const installationDate: DateOnly = {
      year: 2023,
      month: 5,
      day: 1,
    }

    const installWeekSheet: TimeSheet = {
      dates: {
        monday: {
          year: 2023,
          month: 5,
          day: 1,
        },
        tuesday: {
          year: 2023,
          month: 5,
          day: 2,
        },
        wednesday: {
          year: 2023,
          month: 5,
          day: 3,
        },
        thursday: {
          year: 2023,
          month: 5,
          day: 4,
        },
        friday: {
          year: 2023,
          month: 5,
          day: 5,
        },
        saturday: {
          year: 2023,
          month: 5,
          day: 6,
        },
        sunday: {
          year: 2023,
          month: 5,
          day: 7,
        },
      },
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
    }

    const currentWeekSheet: TimeSheet = {
      dates: {
        monday: {
          year: 2023,
          month: 5,
          day: 8,
        },
        tuesday: {
          year: 2023,
          month: 5,
          day: 9,
        },
        wednesday: {
          year: 2023,
          month: 5,
          day: 10,
        },
        thursday: {
          year: 2023,
          month: 5,
          day: 11,
        },
        friday: {
          year: 2023,
          month: 5,
          day: 12,
        },
        saturday: {
          year: 2023,
          month: 5,
          day: 13,
        },
        sunday: {
          year: 2023,
          month: 5,
          day: 14,
        },
      },
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
    }

    await mockStorage.set({
      installationDate,
      'timesheet-05/01/2023': installWeekSheet,
      'timesheet-05/08/2023': currentWeekSheet,
    })

    const actual = await checkShouldNotify(defaultExtensionOptions)
    expect(actual).toBe(false)
  })
})
