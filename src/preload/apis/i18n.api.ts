import { ipcRenderer } from 'electron'
import { I18N_CHANNELS } from '@shared/channels/i18n'
import { I18nAPI } from '@shared/interfaces/i18n'

export const i18nApi: I18nAPI = {
  setLocale: (locale) => ipcRenderer.invoke(I18N_CHANNELS.SET_LOCALE, locale),
}
