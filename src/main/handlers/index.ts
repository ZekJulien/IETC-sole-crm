import { AppDependencies } from '../dependencies'
import { registerLogHandlers } from './log.handler'
import { registerClientHandlers, registerContactHandlers } from './client'

export function registerAllHandlers(deps: AppDependencies): void {
  registerLogHandlers()
  registerClientHandlers(deps.clientService)
  registerContactHandlers(deps.contactService)
}
