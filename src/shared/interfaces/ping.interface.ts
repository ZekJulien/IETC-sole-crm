import { Ping } from './ping.dto'

export interface IPingAPI {
  send:   (message: string) => Promise<Ping>
  getAll: ()               => Promise<Ping[]>
}
