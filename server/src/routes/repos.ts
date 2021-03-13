import fs from 'fs'
import path from 'path'
import util from 'util'
import express from 'express'
import * as Global from '../globals.js'
import { Directory, Submodule } from '../apis/api.js'
import GitHubAPI, { GitHubRepoInfo } from '../apis/github.js'
import NodegitAPI, { NodegitRepoInfo } from '../apis/nodegit.js'

export const repos = express.Router()

export interface RepoInfo {
	name: string
	type: string
	url: string
}

export interface RepoInventory {
	[id: string]: RepoInfo
}

// https://stackoverflow.com/questions/46867517
const readFile = util.promisify(fs.readFile)

async function readRepoInventory() {
	const reposPath = path.join(Global.REPO_HOME, 'repos.json')
	const reposData = await readFile(reposPath, 'utf8')
	if (!reposData)
		return Promise.reject(new Error(`Could not read ${reposPath}`))
	return JSON.parse(reposData)
}

async function findRepoDesc(id: string): Promise<RepoInfo> {
	const repoDescs = await readRepoInventory()
	const repoDesc = repoDescs[id]
	if (!repoDesc)
		return Promise.reject(new Error(`Repo '${id}' does not exist`))
	return repoDesc
}

// API factory. Cannot be moved to api.js due to ReferenceError
// https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/
function getRepoAPI(repoDesc: RepoInfo) {
	switch (repoDesc.type) {
		case NodegitAPI.TYPE:
			return new NodegitAPI(repoDesc as NodegitRepoInfo)

		case GitHubAPI.TYPE:
			return new GitHubAPI(repoDesc as GitHubRepoInfo)
	}
}

function publishedInventory (inventory: any) {
	const result: RepoInventory = {}
	Object.keys(inventory).forEach(key => {
		result[key] = {
			name: inventory[key].name,
			type: inventory[key].type,
			url: inventory[key].url
		}
	})
	return result
}

// list all tags in the repository
repos.get("/", (req, res, next) =>
	readRepoInventory()
	.then(inventory => res.json(publishedInventory(inventory)))
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
