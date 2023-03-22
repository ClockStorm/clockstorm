import { isEqual } from 'lodash'
import { z } from 'zod'
import { DateOnly } from './dates'

export const TimeCardStatus = z.union([
  z.literal('submitted'),
  z.literal('saved'),
  z.literal('unsaved'),
  z.literal('approved'),
])
export type TimeCardStatus = z.infer<typeof TimeCardStatus>

export const WeekStatus = z.union([
  z.literal('no-time-cards'),
  z.literal('some-unsaved'),
  z.literal('some-unsubmitted'),
  z.literal('all-submitted-or-approved'),
])
export type WeekStatus = z.infer<typeof WeekStatus>

export const Hours = z.object({
  monday: z.number(),
  tuesday: z.number(),
  wednesday: z.number(),
  thursday: z.number(),
  friday: z.number(),
  saturday: z.number(),
  sunday: z.number(),
})

export type Hours = z.infer<typeof Hours>

export const TimeCard = z.object({
  hours: Hours,
  status: TimeCardStatus,
})

export type TimeCard = z.infer<typeof TimeCard>

export const TimeSheetDates = z.object({
  monday: DateOnly,
  tuesday: DateOnly,
  wednesday: DateOnly,
  thursday: DateOnly,
  friday: DateOnly,
  saturday: DateOnly,
  sunday: DateOnly,
})

export type TimeSheetDates = z.infer<typeof TimeSheetDates>

export const TimeSheet = z.object({
  dates: TimeSheetDates,
  timeCards: z.array(TimeCard),
})

export type TimeSheet = z.infer<typeof TimeSheet>

export interface DaysFilled {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export const isTimeSheet = (input: any): input is TimeSheet => TimeSheet.safeParse(input).success

export const isTimeSheetEqual = (first: TimeSheet | null, second: TimeSheet | null) => {
  return isEqual(first, second)
}

export interface TimeSheetSummary {
  weekStatus: WeekStatus
  daysFilled: DaysFilled
  totalDaysSubmitted: number
  totalDaysSaved: number
  timeRemaining: string
}
