import { describe, expect, test } from '@jest/globals'
import { isTimeSheetEqual } from '../../src/types/time-sheet'

describe('isTimeSheetEqual', () => {
  test('returns true when time sheets are equal', () => {
    expect(
      isTimeSheetEqual(
        {
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
        {
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
      ),
    ).toBe(true)
  })

  test('returns false when time sheets are not equal', () => {
    expect(
      isTimeSheetEqual(
        {
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
        {
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
                friday: 3,
                saturday: 3,
                sunday: 2,
              },
              status: 'approved',
            },
          ],
        },
      ),
    ).toBe(false)
  })
})
