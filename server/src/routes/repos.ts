import path from 'path'
import express from 'express'
import * as Global from '../globals.js'
import { Directory, Submodule } from '../apis/api.js'
import { GitHubRepoDesc, NodegitRepoDesc, RepoType } from '../classes/Inventory.js'
import GitHubAPI from '../apis/github.js'
import NodegitAPI from '../apis/nodegit.js'

export const repos = express.Router()

function GetRepoAPI(id: string) {
	const repoDesc = Global.RepoInventory.getRepoDesc(id)
	switch (repoDesc.type) {
		case RepoType.LOCAL:
			return new NodegitAPI(repoDesc as NodegitRepoDesc)

		case RepoType.GITHUB:
			return new GitHubAPI(repoDesc as GitHubRepoDesc)
	}
}

// list all tags in the repository
repos.get("/", (req, res, next) =>
	res.json(Global.RepoInventory.allRepoDescs())
)

repos.get("/:id", (req, res, next) =>
	res.json(Global.RepoInventory.getRepoDesc(req.params.id))
)

// list all refs in the repository
repos.get("/:id/refs", (req, res, next) =>
	GetRepoAPI(req.params.id).fetchRefs()
	.then(refs => res.json(refs))
	.catch(reason => next(reason))
)

// list all names of a specific ref type
repos.get("/:id/refs/:ref", (req, res, next) =>
	GetRepoAPI(req.params.id).fetchRefs()
	.then(refs => res.json(refs
		.filter(ref => ref.startsWith(req.params.ref))
		.map(ref => ref.slice(req.params.ref.length + 1))))
	.catch(reason => next(reason))
)

// return the content of a file addressed by <ref-path>/<file-path>
repos.get("/:id/refs/*", async (req, res, next) => {
	GetRepoAPI(req.params.id).fetchTreeEntry(req.params[0])
	.then(result => {
		if (result instanceof Buffer) res.send(result)
		else if (result instanceof Directory) res.json(result.getEntries())
		else if (result instanceof Submodule) res.json({ sha: result.getSha()})
	})
	.catch (reason => next(reason))
})
