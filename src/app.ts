import express from "express";
import * as Global from "./globals.js"
import { repos } from "./routes/repos.js"

// tslint:disable:no-console
const app = express()

// define a route handler for the repository inspection
app.use('/repos', repos)

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    throw new Error('No root')
})

// start the server
try {
    // check if the REPO_HOME environment variable is set
    if (Global.REPO_HOME === undefined) {
        throw new Error("REPO_HOME environment variable not set.")
    }

    // start the Express server
    app.listen( Global.PORT, () => {
        console.log(`listening on port ${Global.PORT}`)
    })
}
catch (err) {
    console.error(err)
}
