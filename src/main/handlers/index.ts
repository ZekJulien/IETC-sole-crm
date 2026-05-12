import { AppDependencies } from '../dependencies'
import { registerPingHandlers } from './ping.handler'
import { registerLogHandlers } from './log.handler'

export function registerAllHandlers(deps: AppDependencies): void {
  registerLogHandlers()
  registerPingHandlers(deps.pingService)
}
