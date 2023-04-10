import { beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { getEveryMondaySinceInstallation } from '../../src/installation/helpers'
import { DateOnly } from '../../src/types/dates'
import { createMockLocalStorage, installMockLocalStorage } from '../mocks/mock.chrome-local-storage'

const mockLocalStorage = createMockLocalStorage()
installMockLocalStorage(mockLocalStorage)

describe('getEveryMondaySinceInstallation', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 3, 9, 9, 0, 0))
  })

  beforeEach(async () => {
    await mockLocalStorage.clear()
  })

  test('returns this monday only if it was installed today', async () => {
    const actual = await getEveryMondaySinceInstallation()
    const expected: DateOnly[] = [
      {
        year: 2023,
        month: 4,
        day: 3,
      },
    ]

    expect(actual).toEqual(expected)
  })

  test('returns this monday and last monday if it was installed last week', async () => {
    await mockLocalStorage.set({
      installationDate: {
        year: 2023,
        month: 3,
        day: 30,
      },
    })

    const actual = await getEveryMondaySinceInstallation()
    const expected: DateOnly[] = [
      {
        year: 2023,
        month: 4,
        day: 3,
      },
      {
        year: 2023,
        month: 3,
        day: 27,
      },
    ]

    expect(actual).toEqual(expected)
  })
})
