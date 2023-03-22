import { z } from 'zod'

export const ExtensionOptions = z.object({
  endOfWeekTimesheetReminder: z.boolean().default(true),
  dailyTimeEntryReminder: z.boolean().default(true),
  endOfMonthTimesheetReminder: z.boolean().default(true),
  soundDataUrl: z.string().default('sounds/cricket.wav'),
  gifDataUrl: z.string().default('gifs/clockstorm.gif'),
})
export type ExtensionOptions = z.infer<typeof ExtensionOptions>
