import { z } from 'zod'

export interface FindManyArgs {
  where?:  unknown
  search?: string
  skip?:   number
  take?:   number
  count?:  boolean
}

export const FindManyArgsSchema = z.object({
  where:  z.unknown().optional(),
  search: z.string().optional(),
  skip:   z.number().int().nonnegative().optional(),
  take:   z.number().int().positive().optional(),
  count:  z.boolean().optional(),
}).optional()

export const IdSchema = z.number().int().positive()
