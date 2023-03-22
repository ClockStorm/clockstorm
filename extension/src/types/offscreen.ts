import { z } from 'zod'

export const PlayAudioMessage = z.object({
  type: z.literal('play-audio'),
  source: z.string(),
  volume: z.number(),
  id: z.number(),
})
export type PlayAudioMessage = z.infer<typeof PlayAudioMessage>

export const StopAudioMessage = z.object({
  type: z.literal('stop-audio'),
  id: z.number(),
})
export type StopAudioMessage = z.infer<typeof StopAudioMessage>

export const Message = z.union([PlayAudioMessage, StopAudioMessage])
export type Message = z.infer<typeof Message>
