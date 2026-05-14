import { AppDependencies } from '../dependencies'
import { registerLogHandlers } from './log.handler'

export function registerAllHandlers(deps: AppDependencies): void {
  registerLogHandlers()
}
