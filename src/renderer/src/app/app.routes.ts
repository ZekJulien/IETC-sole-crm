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
]
