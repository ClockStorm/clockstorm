import { beforeEach, describe, expect, test } from '@jest/globals'
import { getExtensionOptions } from '../../src/extension-options/storage'
import { ExtensionOptions } from '../../src/types/extension-options'
import { createMockLocalStorage, installMockLocalStorage } from '../mocks/mock.chrome-local-storage'

const mockLocalStorage = createMockLocalStorage()
installMockLocalStorage(mockLocalStorage)

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

describe('getExtensionOptions', () => {
  beforeEach(async () => {
    await mockLocalStorage.clear()
  })

  test('returns all defaults when nothing is in storage', async () => {
    const actual = await getExtensionOptions()
    expect(actual).toEqual(defaultExtensionOptions)
  })

  test('returns defaults when an incompatible version is in storage', async () => {
    await mockLocalStorage.set({
      extensionOptions: {
        dailyTimeEntryReminder: 5,
      },
    })

    const actual = await getExtensionOptions()
    expect(actual).toEqual(defaultExtensionOptions)
  })

  test('returns supplemented defaults when an older version is in storage', async () => {
    await mockLocalStorage.set({
      extensionOptions: {
        dailyTimeEntryReminder: false,
        endOfMonthTimesheetReminder: true,
        endOfWeekTimesheetReminder: false,
        gifDataUrl: 'foo',
        soundDataUrl: 'sounds/rooster.wav',
      },
    })

    const actual = await getExtensionOptions()
    expect(actual).toEqual({
      ...defaultExtensionOptions,
      dailyTimeEntryReminder: false,
      endOfMonthTimesheetReminder: true,
      endOfWeekTimesheetReminder: false,
      gifDataUrl: 'foo',
      soundDataUrl: 'sounds/rooster.wav',
    })
  })
})
