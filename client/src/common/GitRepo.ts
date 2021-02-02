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

	async fetchRefs() {
		const refs: GitRef[] = []
		const refPromisses: Promise<any>[] = []
		refPromisses.push(this.fetchTags().then(tags => refs.push(...tags)))
		refPromisses.push(this.fetchBranches().then(branches => refs.push(...branches)))
		await Promise.all(refPromisses)
		return refs
	}

	async fetchBranches() {
		const response = await fetch(`/api/repos/${this.id}/refs/heads`)
		const branches: string[] = await response.json()
		const refs: GitRef[] = branches.map(branch => {
			return { name: branch, refName: `heads/${branch}`, type: GitRefType.Branch }
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
