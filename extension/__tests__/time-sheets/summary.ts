import { beforeAll, describe, expect, jest, test } from '@jest/globals'
import { summarizeTimeSheet } from '../../src/time-sheets/summary'
import { ExtensionOptions } from '../../src/types/extension-options'
import { TimeSheet, TimeSheetDates, TimeSheetSummary } from '../../src/types/time-sheet'

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

describe('summarizeTimeSheet', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 0, 0, 0))
  })

  test('when there are no time cards', () => {
    const emptyTimeSheet: TimeSheet = {
      dates,
      timeCards: [],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '00:00:00',
      weekStatus: 'no-time-cards',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(emptyTimeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when all days are filled out but not submitted', () => {
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 5,
      totalDaysSubmitted: 0,
      timeRemaining: '00:00:00',
      weekStatus: 'some-unsubmitted',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when there are two time cards and both are submitted', () => {
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 5,
      timeRemaining: '00:00:00',
      weekStatus: 'all-submitted-or-approved',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when there are two time cards and one is submitted', () => {
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 3,
      totalDaysSubmitted: 2,
      timeRemaining: '00:00:00',
      weekStatus: 'some-unsubmitted',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when there are two time cards and one includes the weekend', () => {
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
          status: 'submitted',
          hours: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 8,
            sunday: 8,
          },
        },
      ],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: true,
        sunday: true,
      },
      totalDaysSaved: 3,
      totalDaysSubmitted: 2,
      timeRemaining: '00:00:00',
      weekStatus: 'some-unsubmitted',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when you have a time card that is not saved', () => {
    const timeSheet: TimeSheet = {
      dates,
      timeCards: [
        {
          status: 'unsaved',
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '00:00:00',
      weekStatus: 'some-unsaved',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when you have 25 hours left', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 15, 16, 0, 0))

    const timeSheet: TimeSheet = {
      dates,
      timeCards: [
        {
          status: 'unsaved',
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '25:00:00',
      weekStatus: 'some-unsaved',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when you have 1 second left', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 16, 59, 59))

    const timeSheet: TimeSheet = {
      dates,
      timeCards: [
        {
          status: 'unsaved',
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '00:00:01',
      weekStatus: 'some-unsaved',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when you have no time left', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 16, 17, 0, 0))

    const timeSheet: TimeSheet = {
      dates,
      timeCards: [
        {
          status: 'unsaved',
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '00:00:00',
      weekStatus: 'some-unsaved',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when your time card is approved', () => {
    const timeSheet: TimeSheet = {
      dates,
      timeCards: [
        {
          status: 'approved',
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

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 5,
      timeRemaining: '00:00:00',
      weekStatus: 'all-submitted-or-approved',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when the end of the month is wednesday', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 31, 0, 0, 0))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
      timeCards: [],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '17:00:00',
      weekStatus: 'no-time-cards',
      endOfMonthReminderDate: {
        day: 31,
        month: 5,
        year: 2023,
      },
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when the end of the month is wednesday + buzzer beater', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 31, 17, 0, 0))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
      timeCards: [],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '00:00:00',
      weekStatus: 'no-time-cards',
      endOfMonthReminderDate: {
        day: 31,
        month: 5,
        year: 2023,
      },
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when the end of the month is wednesday + buzzer beater failure', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 4, 31, 17, 0, 1))

    const timeSheet: TimeSheet = {
      dates: endOfMonthDates,
      timeCards: [],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '23:59:59',
      weekStatus: 'no-time-cards',
      endOfMonthReminderDate: {
        day: 31,
        month: 5,
        year: 2023,
      },
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when the end of the month is friday which is after the due date', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 3, 30, 9, 0, 0))

    const timeSheet: TimeSheet = {
      dates: {
        monday: {
          year: 2023,
          month: 4,
          day: 27,
        },
        tuesday: {
          year: 2023,
          month: 4,
          day: 28,
        },
        wednesday: {
          year: 2023,
          month: 4,
          day: 29,
        },
        thursday: {
          year: 2023,
          month: 4,
          day: 30,
        },
        friday: {
          year: 2023,
          month: 4,
          day: 31,
        },
        saturday: {
          year: 2023,
          month: 5,
          day: 1,
        },
        sunday: {
          year: 2023,
          month: 5,
          day: 2,
        },
      },
      timeCards: [],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '08:00:00',
      weekStatus: 'no-time-cards',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })

  test('when the end of the month is thursday which is on the due date', () => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 7, 31, 9, 0, 0))

    const timeSheet: TimeSheet = {
      dates: {
        monday: {
          year: 2023,
          month: 8,
          day: 28,
        },
        tuesday: {
          year: 2023,
          month: 8,
          day: 29,
        },
        wednesday: {
          year: 2023,
          month: 8,
          day: 30,
        },
        thursday: {
          year: 2023,
          month: 8,
          day: 31,
        },
        friday: {
          year: 2023,
          month: 9,
          day: 1,
        },
        saturday: {
          year: 2023,
          month: 9,
          day: 2,
        },
        sunday: {
          year: 2023,
          month: 9,
          day: 3,
        },
      },
      timeCards: [],
    }

    const expected: TimeSheetSummary = {
      daysFilled: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      totalDaysSaved: 0,
      totalDaysSubmitted: 0,
      timeRemaining: '08:00:00',
      weekStatus: 'no-time-cards',
      endOfMonthReminderDate: null,
    }

    expect(summarizeTimeSheet(timeSheet, defaultExtensionOptions)).toEqual(expected)
  })
})
