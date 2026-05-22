import { z } from 'zod'

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export const HexColorSchema = z.string().regex(HEX_COLOR)
