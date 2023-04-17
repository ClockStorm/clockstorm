import { beforeAll, describe, expect, jest, test } from '@jest/globals'
import { lightning } from '../../src/data-sources/lightning'
import { TimeSheet } from '../../src/types/time-sheet'

describe('queryTimeSheet', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2023, 2, 19, 0, 0, 0))
    jest.spyOn(console, 'warn').mockImplementation(() => {return});
  })

  test('when the timesheet element does not exist', async () => {
    const actual = await lightning.queryTimeSheet()
    expect(actual).toBeNull()
  })

  test('when there is no week ending element', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual).toBeNull()
  })

  test('when there are no timecard elements', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual.timeCards).toHaveLength(0)
  })

  test('when there are less than 2 timecard column elements', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual.timeCards).toHaveLength(0)
  })

  test('when the timecard project name element does not have an input', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual.timeCards).toHaveLength(0)
  })

  test('when the timecard project name element has no value', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td><input type="text" value="" /></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual.timeCards).toHaveLength(0)
  })

  test('when the timecard status element does not exist', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td><input type="text" value="Test Project" /></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual.timeCards).toHaveLength(0)
  })

  test('when the timecard status element has an unsupported status', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td><input type="text" value="Test Project" /></td>' +
      '      <td data-columnid="statusId"><div>Not Supported</div></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    expect(actual.timeCards).toHaveLength(0)
  })

  test('when the weekday is invalid', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td><input type="text" value="Test Project" /></td>' +
      '      <td data-columnid="statusId"><div>Unsaved</div></td>' +
      '      <td data-columnid="weekDay8"><div>8.00</div></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    const expected: TimeSheet = {
      dates: {
        monday: {
          day: 3,
          month: 4,
          year: 2023
        },
        tuesday: {
          day: 4,
          month: 4,
          year: 2023
        },
        wednesday: {
          day: 5,
          month: 4,
          year: 2023
        },
        thursday: {
          day: 6,
          month: 4,
          year: 2023
        },
        friday: {
          day: 7,
          month: 4,
          year: 2023
        },
        saturday: {
          day: 8,
          month: 4,
          year: 2023
        },
        sunday: {
          day: 9,
          month: 4,
          year: 2023
        },
      },
      timeCards: [
        {
          hours: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
          },
          status: 'unsaved'
        }
      ]
    }
    expect(actual).toStrictEqual(expected)
  })

  test('when a timecard has monday filled out with an invalid number', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td><input type="text" value="Test Project" /></td>' +
      '      <td data-columnid="statusId"><div>Unsaved</div></td>' +
      '      <td data-columnid="weekDay1"><div>X</div></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    const expected: TimeSheet = {
      dates: {
        monday: {
          day: 3,
          month: 4,
          year: 2023
        },
        tuesday: {
          day: 4,
          month: 4,
          year: 2023
        },
        wednesday: {
          day: 5,
          month: 4,
          year: 2023
        },
        thursday: {
          day: 6,
          month: 4,
          year: 2023
        },
        friday: {
          day: 7,
          month: 4,
          year: 2023
        },
        saturday: {
          day: 8,
          month: 4,
          year: 2023
        },
        sunday: {
          day: 9,
          month: 4,
          year: 2023
        },
      },
      timeCards: [
        {
          hours: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0,
          },
          status: 'unsaved'
        }
      ]
    }
    expect(actual).toStrictEqual(expected)
  })

  test('when a timecard has all work days filled out and saved', async () => {
    document.body.innerHTML =
      '<div data-ffid="TimecardGrid">' +
      '  <div data-ffid="weekEnding">' +
      '    <input type="text" value="4/9/2023" />' +
      '  </div>' +
      '  <table>' +
      '    <tr>' +
      '      <td></td>' +
      '      <td><input type="text" value="Test Project" /></td>' +
      '      <td data-columnid="statusId"><div>Saved</div></td>' +
      '      <td data-columnid="weekDay1"><div>8.00</div></td>' +
      '      <td data-columnid="weekDay2"><div>8.00</div></td>' +
      '      <td data-columnid="weekDay3"><div>8.00</div></td>' +
      '      <td data-columnid="weekDay4"><div>8.00</div></td>' +
      '      <td data-columnid="weekDay5"><div>8.00</div></td>' +
      '    </tr>' +
      '  </table>' +
      '</div>';
    const actual = await lightning.queryTimeSheet()
    const expected: TimeSheet = {
      dates: {
        monday: {
          day: 3,
          month: 4,
          year: 2023
        },
        tuesday: {
          day: 4,
          month: 4,
          year: 2023
        },
        wednesday: {
          day: 5,
          month: 4,
          year: 2023
        },
        thursday: {
          day: 6,
          month: 4,
          year: 2023
        },
        friday: {
          day: 7,
          month: 4,
          year: 2023
        },
        saturday: {
          day: 8,
          month: 4,
          year: 2023
        },
        sunday: {
          day: 9,
          month: 4,
          year: 2023
        },
      },
      timeCards: [
        {
          hours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0,
          },
          status: 'saved'
        }
      ]
    }
    expect(actual).toStrictEqual(expected)
  })
})
