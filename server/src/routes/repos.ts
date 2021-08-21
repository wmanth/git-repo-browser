import express from 'express';
import * as common from '@repofs/common';
import { Directory, Submodule } from '../apis/api';
import Config from '../classes/Config';

export const repos = express.Router();

// list all tags in the repository
repos.get("/", (req, res, next) =>
	(req.app.locals.config as Config).getRepoInventory()
	.then(inventory => res.json(inventory))
	.catch(reason => next(reason))
);

repos.get("/:id", (req, res, next) =>
	(req.app.locals.config as Config).getRepoInventory()
	.then(inventory => res.json(inventory[req.params.id]))
	.catch(reason => next(reason))
);

// list all refs in the repository
repos.get("/:id/refs", (req, res, next) =>
	(req.app.locals.config as Config).getRepoAPI(req.params.id)
	.then(repo => repo.getRefs())
	.then(refs => res.json(refs))
	.catch(reason => next(reason))
);

// return the content of a file addressed by <ref-path>/<file-path>
repos.get("/:id/refs/*", async (req, res, next) => {
	try {
		const config = req.app.locals.config as Config;
		const repo = await config.getRepoAPI(req.params.id);
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
				res.set(common.GIT_OBJECT_TYPE_HEADER, common.GitObjectType.file);
				res.send(content);
			}
			else if (content instanceof Directory) {
				res.set(common.GIT_OBJECT_TYPE_HEADER, common.GitObjectType.directory);
				res.json(content.getEntries());
			}
			else if (content instanceof Submodule) {
				res.set(common.GIT_OBJECT_TYPE_HEADER, common.GitObjectType.submodule);
				res.json({ sha: content.getSha() });
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
