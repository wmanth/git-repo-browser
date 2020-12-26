import path from "path";
import express from "express";
import Git from "nodegit"
import { FileEntry } from "../classes/FileEntry.js"
import * as Global from "../globals.js"

export const repos = express.Router()

function repoPath(id: string) {
    return path.join(Global.REPO_HOME, Global.RepoInventory.getEntry(id).local)
}

// list all tags in the repository
repos.get("/list", ( req, res, next ) =>
    res.json(Global.RepoInventory.allEntries())
)

// list all tags in the repository
repos.get("/:id/tags", ( req, res, next ) =>
    Git.Repository.openBare(repoPath(req.params.id))
    .then(repo => Git.Tag.list(repo))
    .then(tags => res.json(tags))
    .catch(reason => next(reason))
)

// list all files in the repository for the given tag name
repos.get( "/:id/lookup", ( req, res, next ) =>
    Git.Repository.openBare(repoPath(req.params.id))
    .then(repo => repo.getReferenceCommit(`refs/tags/${req.query.tagName}`))
    .then(commit => commit.getTree())
    .then(tree => FileEntry.parseTree(tree))
    .then(fileEntries => res.json(fileEntries))
    .catch(reason => next(reason))
)

// list all files in the repository for the given tag name
repos.get( "/:id/content", ( req, res, next ) =>
    Git.Repository.openBare(repoPath(req.params.id))
    .then(repo => repo.getBlob(req.query.sha as string))
    .then(blob => res.send(blob.content()))
    .catch(reason => next(reason))
)
