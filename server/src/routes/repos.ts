import express from 'express';
import * as common from '@wmanth/git-repo-common';
import { Directory, Submodule } from '../apis/api.js';
import { DefaultConfig } from '../classes/Config.js';

export const repos = express.Router();

// list all tags in the repository
repos.get("/", (_, res, next) =>
	DefaultConfig.instance.getRepoInventory()
	.then(inventory => res.json(inventory))
	.catch(reason => next(reason))
);

repos.get("/:id", (req, res, next) =>
	DefaultConfig.instance.getRepoInventory()
	.then(inventory => res.json(inventory[req.params.id]))
	.catch(reason => next(reason))
);

// list all refs in the repository
repos.get("/:id/refs", (req, res, next) =>
	DefaultConfig.instance.getRepoAPI(req.params.id)
	.then(repo => repo.getRefs())
	.then(refs => res.json(refs))
	.catch(reason => next(reason))
);

// return the content of a file addressed by <ref-path>/<file-path>
repos.get("/:id/refs/*", async (req, res, next) => {
	try {
		const repo = await DefaultConfig.instance.getRepoAPI(req.params.id);
		const refs = await repo.getRefs();
		var refPath: string = (req.params as any)[0];
		refPath = refPath.endsWith('/') ? refPath.slice(0, -1) : refPath;

		if (!refPath) {
			res.json(refs);
			return;
		}

		const [ref, path] = common.splitRefFilePath(refPath, refs);
		if (ref) {
			const content = await repo.getContent(ref, path);
			if (content instanceof Buffer) {
				res.send(content);
			}
			else if (content instanceof Directory) {
				res.json(content.getEntries());
			}
			else if (content instanceof Submodule) {
				res.json({ sha: content.getSha()});
			}
		}
		else {
			const matches = common.findRef(refPath, refs);
			res.json(matches);
		}
	}
	catch (reason) {
		next(reason);
	}
});

