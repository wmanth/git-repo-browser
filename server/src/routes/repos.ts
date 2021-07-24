import fs from 'fs';
import path from 'path';
import util from 'util';
import YAML from 'yaml';
import express from 'express';
import * as Global from '../globals.js';
import * as common from '@wmanth/git-repo-common';
import RepoAPI, { Directory, Submodule } from '../apis/api.js';
import GitHubAPI from '../apis/github.js';
import NodegitAPI from '../apis/nodegit.js';

export const repos = express.Router();

// https://stackoverflow.com/questions/46867517
const readFile = util.promisify(fs.readFile);

async function readConfig(): Promise<any> {
	const repoConfigPath = path.join(Global.REPO_HOME, 'repos.yaml');
	const repoConfigData = await readFile(repoConfigPath, 'utf8');
	return YAML.parse(repoConfigData);
}

async function getRepoInventory(): Promise<common.RepoInventory> {
	const config = await readConfig();
	const inventory: common.RepoInventory = {};
	Object.keys(config).forEach(key => {
		inventory[key] = {
			name: config[key].name,
			type: config[key].type,
		};
	});
	return inventory;
}

// API factory. Cannot be moved to api.js due to ReferenceError
// https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/
async function getRepoAPI(repoId: string): Promise<RepoAPI> {
	const config = await readConfig();
	const repoDesc = config[repoId];
	switch (repoDesc.type) {
		case common.RepoType.local:
			return new NodegitAPI(repoDesc.config as common.NodegitRepoConfig);

		case common.RepoType.github:
			return new GitHubAPI(repoDesc.config as common.GitHubRepoConfig);

		default:
			throw new Error(`Could not get repo API for '${repoId}'`);
	}
}

// list all tags in the repository
repos.get("/", (_, res, next) =>
	getRepoInventory()
	.then(inventory => res.json(inventory))
	.catch(reason => next(reason))
);

repos.get("/:id", (req, res, next) =>
	getRepoInventory()
	.then(inventory => res.json(inventory[req.params.id]))
	.catch(reason => next(reason))
);

// list all refs in the repository
repos.get("/:id/refs", (req, res, next) =>
	getRepoAPI(req.params.id)
	.then(repoAPI => repoAPI.fetchRefs())
	.then(refs => res.json(refs))
	.catch(reason => next(reason))
);

// list all names of a specific ref type
repos.get("/:id/refs/:ref", (req, res, next) =>
	getRepoAPI(req.params.id)
	.then(repoAPI => repoAPI.fetchRefs())
	.then(refs => res.json(refs?.filter(ref => ref.startsWith(req.params.ref))
		.map(ref => ref.slice(req.params.ref.length + 1))))
	.catch(reason => next(reason))
);

// return the content of a file addressed by <ref-path>/<file-path>
repos.get("/:id/refs/*", async (req, res, next) => {
	getRepoAPI(req.params.id)
	.then(repoAPI => repoAPI.fetchTreeEntry((req.params as any)[0]))
	.then(result => {
		if (result instanceof Buffer) { res.send(result); }
		else if (result instanceof Directory) { res.json(result.getEntries()); }
		else if (result instanceof Submodule) { res.json({ sha: result.getSha()}); }
	})
	.catch (reason => next(reason));
});
