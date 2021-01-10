import path from "path";
import express from "express";
import Git, { Reference } from "nodegit"
import FileTreeBuilder from "../classes/FileTreeBuilder.js"
import * as Global from "../globals.js"

export const repos = express.Router()

function getRepoPath(id: string) {
    return path.join(Global.REPO_HOME, Global.RepoInventory.getEntry(id).local)
}

// list all tags in the repository
repos.get("/", ( req, res, next ) =>
    res.json(Global.RepoInventory.allEntries())
)

// list all tags in the repository
repos.get("/:id/tags", ( req, res, next ) =>
    Git.Repository.openBare(getRepoPath(req.params.id))
    .then(repo => Git.Tag.list(repo))
    .then(tags => res.json(tags))
    .catch(reason => next(reason))
)

// list all files in the repository for the given tag name
repos.get("/:id/filetree", ( req, res, next ) =>
    Git.Repository.openBare(getRepoPath(req.params.id))
    .then(repo => repo.getReferenceCommit(`refs/tags/${req.query.tag}`))
    .then(commit => commit.getTree())
    .then(tree => FileTreeBuilder.build(tree))
    .then(fileTree => res.json(fileTree.childs))
    .catch(reason => next(reason))
)

// provide the content of the blob determined by given sha
repos.get("/:id/blobs/:sha/content", ( req, res, next ) =>
    Git.Repository.openBare(getRepoPath(req.params.id))
    .then(repo => repo.getBlob(req.params.sha as string))
    .then(blob => res.send(blob.content()))
    .catch(reason => next(reason))
)


repos.get("/:id/refs", ( req, res, next ) =>
    Git.Repository.openBare(getRepoPath(req.params.id))
    .then(repo => repo.getReferenceNames(Reference.TYPE.LISTALL))
    .then(list => res.json(list.map(ref => ref.split('/').slice(1).join('/') )))
    .catch(reason => next(reason))
)

// list all tags in the repository
repos.get("/:id/refs/tags", ( req, res, next ) =>
    Git.Repository.openBare(getRepoPath(req.params.id))
    .then(repo => Git.Tag.list(repo))
    .then(tags => res.json(tags))
    .catch(reason => next(reason))
)

enum EntryType {
    File = 0,
    Directory = 1,
    Submodule = 2
}

interface Entry {
    name: string
    path: string
    type: EntryType
}

function gitTreeEntryToItem(entry: Git.TreeEntry): Entry {
    return {
        name: entry.name(),
        path: entry.path(),
        type: entry.isSubmodule() ? EntryType.Submodule
            : entry.isDirectory() ? EntryType.Directory
            : EntryType.File
    }
}

// return the content of a file addressed by <ref-path>/<file-path>
repos.get("/:id/refs/*", async (req, res, next) => {
    try {
        const repo = await Git.Repository.openBare(getRepoPath(req.params.id))
        const refs = await repo.getReferenceNames(Reference.TYPE.LISTALL)

        // split the wildcard path into a ref-path and file-path
        const refPathElements: string[] = ["refs"]
        const filePathElements = req.params[0].split('/')
        let refPath: string
        let filePath: string
        while (filePathElements.length) {
            refPathElements.push(filePathElements.shift())
            refPath = refPathElements.join('/')
            filePath = filePathElements.join('/')
            if (refs.includes(refPath)) break
        }

        // fetch the referenced commit
        const commit = await repo.getReferenceCommit(refPath)

        // if the root is requested fetch the tree from the commit
        if (filePath.length === 0) {
            const tree = await commit.getTree()
            res.json(tree.entries().map(gitTreeEntryToItem))
        }
        // otherwise fetch the path entry first
        else {
            const entry = await commit.getEntry(filePath)
            if (entry.isBlob()) {
                const blob = await repo.getBlob(entry.sha())
                res.send(blob.content())
            }
            else if (entry.isTree()) {
                const tree = await entry.getTree()
                res.json(tree.entries().map(gitTreeEntryToItem))
            }
            else if (entry.isSubmodule) {
                res.json(entry.sha())
            }
        }
    } catch (error) {
        return next(error)
    }
})
