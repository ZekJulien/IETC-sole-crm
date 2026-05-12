export const PING_CHANNELS = {
  SEND:    'ping:send',
  GET_ALL: 'ping:getAll',
} as const

export type PingChannel = typeof PING_CHANNELS[keyof typeof PING_CHANNELS]
