import { z } from 'zod'
import { DayOfWeek, TimeOnly } from './dates'

export const ExtensionOptions = z.object({
  endOfWeekTimesheetReminder: z.boolean().default(true),
  dailyTimeEntryReminder: z.boolean().default(true),
  endOfMonthTimesheetReminder: z.boolean().default(true),
  soundDataUrl: z.string().default('sounds/cricket.wav'),
  gifDataUrl: z.string().default('gifs/clockstorm.gif'),
  dailyReminderDaysOfWeek: z.array(DayOfWeek).default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  dailyReminderStartTime: TimeOnly.default({
    hour: 9,
    minute: 0,
  }),
  endOfWeekReminderDayOfWeek: DayOfWeek.default('thursday'),
  endOfWeekReminderStartTime: TimeOnly.default({
    hour: 9,
    minute: 0,
  }),
  endOfWeekReminderDueTime: TimeOnly.default({
    hour: 17,
    minute: 0,
  }),
  endOfMonthReminderStartTime: TimeOnly.default({
    hour: 9,
    minute: 0,
  }),
  endOfMonthReminderDueTime: TimeOnly.default({
    hour: 17,
    minute: 0,
  }),
})

export type ExtensionOptions = z.infer<typeof ExtensionOptions>
