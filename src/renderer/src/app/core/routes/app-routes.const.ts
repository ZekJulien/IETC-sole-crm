const PATHS = {
  home:                      '',
  clients:                   'clients',
  projects:                  'projects',
  projectNew:                'projects/new',
  projectDetail:             'projects/:id',
  tasks:                     'tasks',
  settings:                  'settings',
  settingsCompany:           'settings/company',
  settingsCategories:        'settings/categories',
  settingsExpenseCategories: 'settings/expense-categories',
} as const

export const AppRoutes = {
  paths: PATHS,
  nav: {
    home:                      `/${PATHS.home}`,
    clients:                   `/${PATHS.clients}`,
    projects:                  `/${PATHS.projects}`,
    tasks:                     `/${PATHS.tasks}`,
    settings:                  `/${PATHS.settings}`,
    settingsCompany:           `/${PATHS.settingsCompany}`,
    settingsCategories:        `/${PATHS.settingsCategories}`,
    settingsExpenseCategories: `/${PATHS.settingsExpenseCategories}`,
  },
} as const
