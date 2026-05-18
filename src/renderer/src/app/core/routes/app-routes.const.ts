const PATHS = {
  home:    '',
  clients: 'clients',
} as const

export const AppRoutes = {
  paths: PATHS,
  nav: {
    home:    `/${PATHS.home}`,
    clients: `/${PATHS.clients}`,
  },
} as const
