import { z } from 'zod'
import { I18N_CHANNELS } from '@shared/channels/i18n'
import { ipcHandleNoTx } from '../../core/ipc.handle'
import { setLocale } from '../../i18n'

export function registerI18nHandlers(): void {
  ipcHandleNoTx(I18N_CHANNELS.SET_LOCALE, z.string(), (locale) => setLocale(locale))
}
