/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'
import { MemoryRouter } from '@solidjs/router'
import routes from './routes.tsx'

const root = document.getElementById('root')

render(() => <MemoryRouter root={App}>{routes}</MemoryRouter>, root!)
