import { z } from 'zod'

export const NotificationPayloadSchema = z.object({
  title: z.string().min(1),
  body:  z.string(),
})

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>
