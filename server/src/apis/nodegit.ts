import { join } from 'path'
import { REPO_HOME } from '../globals.js'
import RepoAPI, { Directory, TreeEntry, TreeEntryType, Submodule } from './api.js'
import Git, { Reference } from 'nodegit'
import { RepoDesc } from '../routes/repos.js'

export interface NodegitRepoDesc extends RepoDesc {
	local: string
	remote: string
}

function gitTreeEntryToItem(entry: Git.TreeEntry): TreeEntry {
	return {
		name: entry.name(),
		path: entry.path(),
		type: entry.isSubmodule() ? TreeEntryType.Submodule
			: entry.isDirectory() ? TreeEntryType.Directory
			: TreeEntryType.File
	}
}

export default class NodegitAPI extends RepoAPI {
	private path: string

	static TYPE = "local"

	constructor(desc: NodegitRepoDesc) {
		super(desc)
		this.path = join(REPO_HOME, desc.local)
	}

	async fetchRefs() {
		const repo = await Git.Repository.openBare(this.path)
		const refs = await repo.getReferenceNames(Reference.TYPE.LISTALL)
		return refs.map(ref => ref.slice('refs/'.length))
	}

	async fetchContent(refPath: string, resPath: string): Promise<Buffer | Directory | Submodule> {
		const repo = await Git.Repository.openBare(this.path)

		// fetch the referenced commit
		// see https://github.com/nodegit/nodegit/issues/1370
		const ref = await repo.getReference(join('refs', refPath))
		const obj = await ref.peel(Git.Object.TYPE.COMMIT)
		const oid = obj.id()
		const commit = await repo.getCommit(oid)

		// if the root is requested fetch the tree from the commit
		if (resPath.length === 0) {
			const tree = await commit.getTree()
			return new Directory(tree.entries().map(gitTreeEntryToItem))
		}
		// otherwise fetch the path entry first
		else {
			const entry = await commit.getEntry(resPath)
			if (entry.isBlob()) {
				const blob = await repo.getBlob(entry.sha())
				return blob.content()
			}
			else if (entry.isTree()) {
				const tree = await entry.getTree()
				return new Directory(tree.entries().map(gitTreeEntryToItem))
			}
			else if (entry.isSubmodule) {
				return new Submodule(entry.sha())
			}
		}
		return Promise.reject(new Error('unknown error'))
	}
}
