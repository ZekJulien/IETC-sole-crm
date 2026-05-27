import { z } from 'zod'

export const SavePomodoroSettingsSchema = z.object({
  workMinutes:       z.number().int().min(1).max(180),
  shortBreakMinutes: z.number().int().min(1).max(60),
  longBreakMinutes:  z.number().int().min(1).max(120),
  longBreakInterval: z.number().int().min(2).max(12),
})

export type SavePomodoroSettingsDto = z.infer<typeof SavePomodoroSettingsSchema>
