import { beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { getInstallationDate } from '../../src/installation/storage'
import { DateOnly } from '../../src/types/dates'
import { createMockLocalStorage, installMockLocalStorage } from '../mocks/mock.chrome-local-storage'

const mockLocalStorage = createMockLocalStorage()
installMockLocalStorage(mockLocalStorage)

describe('getInstallationDate', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 3, 9, 9, 0, 0))
  })

  beforeEach(async () => {
    await mockLocalStorage.clear()
  })

  test('returns current date if there is not an installation date stored', async () => {
    const actual = await getInstallationDate()
    const expected: DateOnly = {
      year: 2023,
      month: 4,
      day: 9,
    }

    expect(actual).toEqual(expected)
  })

  test('returns stored date if there is an installation date stored', async () => {
    await mockLocalStorage.set({
      installationDate: {
        year: 2023,
        month: 1,
        day: 2,
      },
    })

    const actual = await getInstallationDate()
    const expected: DateOnly = {
      year: 2023,
      month: 1,
      day: 2,
    }

    expect(actual).toEqual(expected)
  })

  test('returns today if there is an installation date stored but it can not be parsed', async () => {
    await mockLocalStorage.set({
      installationDate: 'hello',
    })

    const actual = await getInstallationDate()
    const expected: DateOnly = {
      year: 2023,
      month: 4,
      day: 9,
    }

    expect(actual).toEqual(expected)
  })
})
