import express from "express";
import Git, { Tree } from 'nodegit'
import { exit } from "process";
import { FileEntry } from "./FileEntry.js"

// tslint:disable:no-console

const app = express()
const port = process.env.PORT || 8080
const repoPath = process.env.REPO_PATH

// check if the REPO_PATH env var was set
if (repoPath === undefined) {
    console.error("Error: REPO_PATH environment variable not set.")
    exit(-1)
}

let repo: Git.Repository

Git.Repository.openBare(repoPath)
.then( _repo => {
    repo = _repo

    // start the Express server
    app.listen( port, () => {
        console.log(`listening on port ${ port } for '${repoPath}'`)
    })
})
.catch( () => {
    console.error(`Error: could not open repository '${repoPath}'`)
    exit(-1)
})

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    throw new Error('No root')
})

app.get( "/tags", ( req, res, next ) => {
    Git.Tag.list(repo)
    .then(tags => { res.json(tags) })
    .catch(reason => { next(reason) })
})

app.get( "/lookup", ( req, res, next ) => {
    repo.getReferenceCommit(`refs/tags/${req.query.tagName}`)
    .then(commit => commit.getTree())
    .then(tree => FileEntry.parseTree(tree))
    .then(fileEntries => res.json(fileEntries))
    .catch(reason => { next(reason) })
})
