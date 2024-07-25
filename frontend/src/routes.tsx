import { RouteDefinition } from '@solidjs/router'
import Home from './pages/Home'

export default [
  {
    path: '/',
    component: Home,
  },
] satisfies RouteDefinition[]
