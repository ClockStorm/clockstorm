import { z } from 'zod'

export const ExtensionOptions = z.object({
  endOfWeekTimesheetReminder: z.boolean(),
  dailyTimeEntryReminder: z.boolean(),
  soundDataUrl: z.string(),
  gifDataUrl: z.string(),
})
export type ExtensionOptions = z.infer<typeof ExtensionOptions>
