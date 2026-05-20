const PATHS = {
  home:            '',
  clients:         'clients',
  settingsCompany: 'settings/company',
} as const

export const AppRoutes = {
  paths: PATHS,
  nav: {
    home:            `/${PATHS.home}`,
    clients:         `/${PATHS.clients}`,
    settingsCompany: `/${PATHS.settingsCompany}`,
  },
} as const
