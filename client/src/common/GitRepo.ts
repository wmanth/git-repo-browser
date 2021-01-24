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
	File = 0,
	Directory = 1,
	Submodule = 2
}

export interface GitTreeEntry {
	name: string
	path: string
	type: GitTreeEntryType
}

export enum GitRefType {
	Branch, Tag
}

export interface GitRef {
	name: string
	refName: string
	type: GitRefType
}

export default class GitRepo {
	private id: string

	constructor(id: string) {
		this.id = id
	}

	static async fetchInventory() {
		const response = await fetch('/api/repos')
		const inventory: RepoInventory = await response.json()
		return inventory
	}

	getId = () => this.id

	async fetchBranches() {
		const response = await fetch(`/api/repos/${this.id}/refs/heads`)
		const tags: string[] = await response.json()
		const refs: GitRef[] = tags.map(tag => {
			return { name: tag, refName: `heads/${tag}`, type: GitRefType.Branch }
		})
		return refs
	}

	async fetchTags() {
		const response = await fetch(`/api/repos/${this.id}/refs/tags`)
		const tags: string[] = await response.json()
		const refs: GitRef[] = tags.map(tag => {
			return { name: tag, refName: `tags/${tag}`, type: GitRefType.Tag }
		})
		return refs
	}

	async fetchPath(ref: GitRef, path: string) {
		return fetch(`/api/repos/${this.id}/refs/${ref.refName}/${path}`)
	}
}
