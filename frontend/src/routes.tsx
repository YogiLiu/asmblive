import { RouteDefinition } from '@solidjs/router'
import Home from './pages/Home'
import { lazy } from 'solid-js'

export default [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/boards/:id',
    component: lazy(() => import('./pages/Board')),
  },
  {
    path: '/settings',
    component: lazy(() => import('./pages/Setting')),
  },
] satisfies RouteDefinition[]
