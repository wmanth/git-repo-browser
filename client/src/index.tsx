import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import RepoViewer, { RepoViewerRoute } from './routes/RepoViewer'
import NotFound from './components/NotFound'
import './index.scss'

ReactDOM.render(
	<React.StrictMode>
		<BrowserRouter>
			<Switch>
				<Route path={ RepoViewerRoute } component={ RepoViewer } />
				<Redirect from="/" to={ RepoViewerRoute } exact />
				<Route path="/" component={ NotFound } />
			</Switch>
		</BrowserRouter>
	</React.StrictMode>,
	document.getElementById('root')
)

