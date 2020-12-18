import path from "path";
import express from "express";
import Git from "nodegit"
import { FileEntry } from "../classes/FileEntry.js"
import * as Global from "../globals.js"

export const repos = express.Router()

// list all tags in the repository
repos.get("/:id/tags", ( req, res, next ) => {
    const repoPath = path.join(Global.REPO_HOME, Global.RepoInventory.getEntry(req.params.id).local)
    Git.Repository.openBare(repoPath)
    .then(repo => Git.Tag.list(repo))
    .then(tags => { res.json(tags) })
    .catch(reason => { next(reason) })
})

// list all files in the repository for the given tag name
repos.get( "/:id/lookup", ( req, res, next ) => {
    const repoPath = path.join(Global.REPO_HOME, Global.RepoInventory.getEntry(req.params.id).local)
    Git.Repository.openBare(repoPath)
    .then(repo => repo.getReferenceCommit(`refs/tags/${req.query.tagName}`))
    .then(commit => commit.getTree())
    .then(tree => FileEntry.parseTree(tree))
    .then(fileEntries => res.json(fileEntries))
    .catch(reason => { next(reason) })
})
