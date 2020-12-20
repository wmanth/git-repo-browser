import express from "express"
import morgan from "morgan"
import * as Global from "./globals.js"
import { repos } from "./routes/repos.js"

// tslint:disable:no-console
const app = express()

// log HTTP requests
app.use(morgan('tiny'))

// define a route handler for the repository inspection
app.use("/repos", repos)

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    throw new Error('No root')
})

// start the server
app.listen( Global.PORT, () => {
    console.log(`listening on port ${Global.PORT}`)
})
