import express from "express"
import morgan from "morgan"
import path from "path"
import * as Global from "./globals.js"
import { repos } from "./routes/repos.js"

// tslint:disable:no-console
const server = express()

// host static react client
server.use(express.static(path.resolve('dist', 'public')))

// log HTTP requests
server.use(morgan('tiny'))

// define a route handler for the repository inspection routines
server.use("/repos", repos)

// start the server
server.listen( Global.PORT, () => {
    console.log(`listening on port ${Global.PORT}`)
})
