import fs from 'fs'
import path from 'path'
import util from 'util'
import express from 'express'
import * as Global from '../globals.js'
import { Directory, Submodule } from '../apis/api.js'
import GitHubAPI, { GitHubRepoDesc } from '../apis/github.js'
import NodegitAPI, { NodegitRepoDesc } from '../apis/nodegit.js'

export const repos = express.Router()

export interface RepoDesc {
	name: string
	type: string
}

// https://stackoverflow.com/questions/46867517
const readFile = util.promisify(fs.readFile)

async function readRepoDescs() {
	const reposPath = path.join(Global.REPO_HOME, 'repos.json')
	const reposData = await readFile(reposPath, 'utf8')
	if (!reposData)
		return Promise.reject(new Error(`Could not read ${reposPath}`))
	return JSON.parse(reposData)
}

async function findRepoDesc(id: string): Promise<RepoDesc> {
	const repoDescs = await readRepoDescs()
	const repoDesc = repoDescs[id]
	if (!repoDesc)
		return Promise.reject(new Error(`Repo '${id}' does not exist`))
	return repoDesc
}

// API factory. Cannot be moved to api.js due to ReferenceError
// https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/
function getRepoAPI(repoDesc: RepoDesc) {
	switch (repoDesc.type) {
		case NodegitAPI.TYPE:
			return new NodegitAPI(repoDesc as NodegitRepoDesc)

		case GitHubAPI.TYPE:
			return new GitHubAPI(repoDesc as GitHubRepoDesc)
	}
}

// list all tags in the repository
repos.get("/", (req, res, next) =>
	readRepoDescs()
	.then(repoDescs => res.json(repoDescs))
	.catch(reason => next(reason))
)

repos.get("/:id", (req, res, next) =>
	findRepoDesc(req.params.id)
	.then(repoDesc => res.json(repoDesc))
	.catch(reason => next(reason))
)

// list all refs in the repository
repos.get("/:id/refs", (req, res, next) =>
	findRepoDesc(req.params.id)
	.then(repoDesc => getRepoAPI(repoDesc))
	.then(repoAPI => repoAPI.fetchRefs())
	.then(refs => res.json(refs))
	.catch(reason => next(reason))
)

// list all names of a specific ref type
repos.get("/:id/refs/:ref", (req, res, next) =>
	findRepoDesc(req.params.id)
	.then(repoDesc => getRepoAPI(repoDesc))
	.then(repoAPI => repoAPI.fetchRefs())
	.then(refs => res.json(refs
		.filter(ref => ref.startsWith(req.params.ref))
		.map(ref => ref.slice(req.params.ref.length + 1))))
	.catch(reason => next(reason))
)

// return the content of a file addressed by <ref-path>/<file-path>
repos.get("/:id/refs/*", async (req, res, next) => {
	findRepoDesc(req.params.id)
	.then(repoDesc => getRepoAPI(repoDesc))
	.then(repoAPI => repoAPI.fetchTreeEntry(req.params[0]))
	.then(result => {
		if (result instanceof Buffer) res.send(result)
		else if (result instanceof Directory) res.json(result.getEntries())
		else if (result instanceof Submodule) res.json({ sha: result.getSha()})
	})
	.catch (reason => next(reason))
})
