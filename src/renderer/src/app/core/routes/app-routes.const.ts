const PATHS = {
  home:               '',
  clients:            'clients',
  settings:           'settings',
  settingsCompany:    'settings/company',
  settingsCategories: 'settings/categories',
} as const

export const AppRoutes = {
  paths: PATHS,
  nav: {
    home:               `/${PATHS.home}`,
    clients:            `/${PATHS.clients}`,
    settings:           `/${PATHS.settings}`,
    settingsCompany:    `/${PATHS.settingsCompany}`,
    settingsCategories: `/${PATHS.settingsCategories}`,
  },
} as const
