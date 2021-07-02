import express from "express"
import morgan from "morgan"
import path from "path"
import * as Global from "./globals.js"
import { config } from "./routes/config.js"
import { repos } from "./routes/repos.js"

// tslint:disable:no-console
const server = express()

// log HTTP requests
// server.use(morgan('tiny'))

// host static react client resources
server.use(express.static(path.resolve('dist', 'public')))

// define a route handle for the server configuration
server.use('/config', config)

// define a route handler for the repository inspection routines
server.use('/api/repos', repos)

// forward all other routes to the react client app
server.get('*', (_, res) => {
	res.sendFile(path.resolve('dist', 'public', 'index.html'));
})

// start the server
server.listen( Global.PORT, () => {
	console.log(`listening on port ${Global.PORT}`)
})
