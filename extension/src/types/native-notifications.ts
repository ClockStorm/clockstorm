import { z } from 'zod'

export const NativeNotifications = z.object({
  daily: z.boolean().default(false),
  weekly: z.boolean().default(false),
  monthly: z.boolean().default(false),
})
export type NativeNotifications = z.infer<typeof NativeNotifications>
