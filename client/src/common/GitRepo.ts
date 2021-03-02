export interface RepoInfo {
    name: string
    local: string
    remote: string
}

interface Dictionary<T> {
	[key: string]: T
}

export type RepoInventory = Dictionary<RepoInfo>

export enum GitTreeEntryType {
	File = 'file',
	Directory = 'directory',
	Submodule = 'submodule'
}

export interface GitTreeEntry {
	name: string
	path: string
	type: GitTreeEntryType
}

export class GitRef {
	constructor(readonly name: string, readonly refName: string) {}
	isTag() { return this.refName.startsWith('tags' ) }
	isBranch() { return this.refName.startsWith('heads' ) }
}

export default class GitRepo {
	private id: string
	private info: RepoInfo

	constructor(id: string, info: RepoInfo) {
		this.id = id
		this.info = info
	}

	static async fetchInventory() {
		const response = await fetch('/api/repos')
		const inventory: RepoInventory = await response.json()
		return inventory
	}

	getId = () => this.id
	getInfo = () => this.info

	async fetchRefs() {
		const response = await fetch(`/api/repos/${this.id}/refs`)
		const refNames: string[] = await response.json()
		const refs: GitRef[] = refNames.map(refName => {
			const [, name] = refName.split('/', 2)
			return new GitRef(name, refName)
		})
		return refs
	}

	async fetchBranches() {
		const response = await fetch(`/api/repos/${this.id}/refs/heads`)
		const branches: string[] = await response.json()
		const refs: GitRef[] = branches.map(branch => {
			return new GitRef(branch, `heads/${branch}`)
		})
		return refs
	}

	async fetchTags() {
		const response = await fetch(`/api/repos/${this.id}/refs/tags`)
		const tags: string[] = await response.json()
		const refs: GitRef[] = tags.map(tag => {
			return new GitRef(tag, `tags/${tag}`)
		})
		return refs
	}

	async defaultBranch() {
		const branches = await this.fetchBranches()
		const masterRef = branches.find(branch => branch.name === 'master')
		const ref = masterRef ? masterRef : branches[0]
		return ref
	}

	async fetchPath(ref: GitRef, path: string) {
		return fetch(`/api/repos/${this.id}/refs/${ref.refName}/${path}`)
	}
}
