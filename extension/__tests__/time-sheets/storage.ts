import { describe, expect, jest, test } from '@jest/globals'
import { getTimeSheet } from '../../src/time-sheets/storage'
import { TimeSheet } from '../../src/types/time-sheet'

type GetFunction = (keys?: string | string[] | { [key: string]: any } | null) => Promise<{ [key: string]: any }>
const getMock = jest.fn<GetFunction>()

const chromeMock = {
  storage: {
    local: {
      get: getMock,
    },
  },
}

const a = globalThis as any
a.chrome = chromeMock

const expectedDefaultTimeSheet: TimeSheet = {
  dates: {
    monday: { year: 2021, month: 1, day: 4 },
    tuesday: { year: 2021, month: 1, day: 5 },
    wednesday: { year: 2021, month: 1, day: 6 },
    thursday: { year: 2021, month: 1, day: 7 },
    friday: { year: 2021, month: 1, day: 8 },
    saturday: { year: 2021, month: 1, day: 9 },
    sunday: { year: 2021, month: 1, day: 10 },
  },
  timeCards: [],
}

describe('getExtensionOptions', () => {
  test('returns expected default when nothing is in storage', async () => {
    getMock.mockResolvedValue({})

    const actual = await getTimeSheet({ year: 2021, month: 1, day: 4 })
    expect(actual).toEqual(expectedDefaultTimeSheet)
  })

  test('returns defaults when an incompatible version is in storage', async () => {
    getMock.mockResolvedValue({
      'timesheet-01/04/2021': {
        dates: true,
      },
    })

    const actual = await getTimeSheet({ year: 2021, month: 1, day: 4 })
    expect(actual).toEqual(expectedDefaultTimeSheet)
  })

  test('returns time sheet when in storage', async () => {
    getMock.mockResolvedValue({
      'timesheet-01/04/2021': {
        dates: {
          monday: { year: 2021, month: 1, day: 4 },
          tuesday: { year: 2021, month: 1, day: 5 },
          wednesday: { year: 2021, month: 1, day: 6 },
          thursday: { year: 2021, month: 1, day: 7 },
          friday: { year: 2021, month: 1, day: 8 },
          saturday: { year: 2021, month: 1, day: 9 },
          sunday: { year: 2021, month: 1, day: 10 },
        },
        timeCards: [
          {
            hours: {
              monday: 8,
              tuesday: 7,
              wednesday: 6,
              thursday: 5,
              friday: 4,
              saturday: 3,
              sunday: 2,
            },
            status: 'approved',
          },
        ],
      },
    })

    const actual = await getTimeSheet({ year: 2021, month: 1, day: 4 })
    expect(actual).toEqual({
      dates: {
        monday: { year: 2021, month: 1, day: 4 },
        tuesday: { year: 2021, month: 1, day: 5 },
        wednesday: { year: 2021, month: 1, day: 6 },
        thursday: { year: 2021, month: 1, day: 7 },
        friday: { year: 2021, month: 1, day: 8 },
        saturday: { year: 2021, month: 1, day: 9 },
        sunday: { year: 2021, month: 1, day: 10 },
      },
      timeCards: [
        {
          hours: {
            monday: 8,
            tuesday: 7,
            wednesday: 6,
            thursday: 5,
            friday: 4,
            saturday: 3,
            sunday: 2,
          },
          status: 'approved',
        },
      ],
    })
  })
})
