import { join } from 'path';
import RepoAPI, { Directory, TreeEntry, Submodule } from './api';
import Git, { Reference } from 'nodegit';
import * as common from '@wmanth/git-repo-common';

function gitTreeEntryToItem(entry: Git.TreeEntry): TreeEntry {
	return {
		name: entry.name(),
		path: entry.path(),
		type: entry.isSubmodule() ? common.GitObjectType.submodule
			: entry.isDirectory() ? common.GitObjectType.directory
			: common.GitObjectType.file
	};
}

export default class NodegitAPI implements RepoAPI {
	private repoPath: string;

	constructor(repoHome: string, repoConfig: common.NodegitRepoConfig) {
		this.repoPath = join(repoHome, repoConfig.local);
	}

	async getRefs() {
		const repo = await Git.Repository.openBare(this.repoPath);
		const refs = await repo.getReferenceNames(Reference.TYPE.LISTALL);
		return refs.map(ref => ref.slice('refs/'.length));
	}

	async getContent(refPath: string, resPath: string): Promise<Buffer | Directory | Submodule> {
		const repo = await Git.Repository.openBare(this.repoPath);

		// fetch the referenced commit
		// see https://github.com/nodegit/nodegit/issues/1370
		const ref = await repo.getReference(join('refs', refPath));
		const obj = await ref.peel(Git.Object.TYPE.COMMIT);
		const oid = obj.id();
		const commit = await repo.getCommit(oid);

		// if the root is requested fetch the tree from the commit
		if (resPath.length === 0) {
			const tree = await commit.getTree();
			return new Directory(tree.entries().map(gitTreeEntryToItem));
		}
		// otherwise fetch the path entry first
		else {
			const entry = await commit.getEntry(resPath);
			if (entry.isBlob()) {
				const blob = await repo.getBlob(entry.sha());
				return blob.content();
			}
			else if (entry.isTree()) {
				const tree = await entry.getTree();
				return new Directory(tree.entries().map(gitTreeEntryToItem));
			}
			else if (entry.isSubmodule()) {
				return new Submodule(entry.sha());
			}
		}
		return Promise.reject(new Error('unknown error'));
	}
}
