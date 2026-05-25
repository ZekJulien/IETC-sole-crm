import { Routes } from '@angular/router'
import { AppRoutes } from './core/routes/app-routes.const'

export const routes: Routes = [
  {
    path: AppRoutes.paths.home,
    loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.Dashboard)
  },
  {
    path: AppRoutes.paths.clients,
    loadComponent: () => import('./features/client/pages/client-list/client-list').then(c => c.ClientList)
  },
  {
    path: AppRoutes.paths.projects,
    pathMatch: 'full',
    loadComponent: () => import('./features/project/pages/project-list/project-list').then(c => c.ProjectList)
  },
  {
    path: AppRoutes.paths.projectNew,
    loadComponent: () => import('./features/project/pages/project-detail/project-detail').then(c => c.ProjectDetail)
  },
  {
    path: AppRoutes.paths.projectDetail,
    loadComponent: () => import('./features/project/pages/project-detail/project-detail').then(c => c.ProjectDetail)
  },
  {
    path: AppRoutes.paths.tasks,
    loadComponent: () => import('./features/task/pages/task-board/task-board').then(c => c.TaskBoard)
  },
  {
    path: AppRoutes.paths.time,
    loadComponent: () => import('./features/time-entry/pages/time-journal/time-journal').then(c => c.TimeJournal)
  },
  {
    path: AppRoutes.paths.settings,
    pathMatch: 'full',
    redirectTo: AppRoutes.paths.settingsCompany,
  },
  {
    path: AppRoutes.paths.settingsCompany,
    loadComponent: () => import('./features/company/pages/company-settings/company-settings').then(c => c.CompanySettings)
  },
  {
    path: AppRoutes.paths.settingsCategories,
    loadComponent: () => import('./features/category/pages/category-settings/category-settings').then(c => c.CategorySettings)
  },
  {
    path: AppRoutes.paths.settingsExpenseCategories,
    loadComponent: () => import('./features/expense-category/pages/expense-category-settings/expense-category-settings').then(c => c.ExpenseCategorySettings)
  },
]
