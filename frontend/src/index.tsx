/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'
import { HashRouter } from '@solidjs/router'
import routes from './routes'

const root = document.getElementById('root')

render(() => <HashRouter root={App}>{routes}</HashRouter>, root!)
