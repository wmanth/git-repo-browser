import { normalize } from 'path'

// tslint:disable:max-classes-per-file

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

export interface GitTreeNode {
	isFile(): boolean
	isDirectory(): boolean
	isSubmodule(): boolean
	getPath(): string
	getChilds(): GitTreeNodeMap | undefined

	fetchChilds(): Promise<GitTreeNodeMap>
}

type GitTreeNodeMap = Map<string, GitTreeNode>

class GitTreeNodeImpl implements GitTreeNode {
	private path: string
	private type: GitTreeEntryType
	private childs?: GitTreeNodeMap
	private repoBase: () => string

	constructor(repoBase: () => string, path: string, type: GitTreeEntryType) {
		this.path = path
		this.type = type
		this.repoBase = repoBase
	}

	isFile = () => (this.type === GitTreeEntryType.File)
	isDirectory = () => (this.type === GitTreeEntryType.Directory)
	isSubmodule = () => (this.type === GitTreeEntryType.Submodule)
	getPath = () => this.path
	getChilds = () => this.childs

	async fetchChilds(): Promise<GitTreeNodeMap> {
		if (!this.isDirectory()) return Promise.reject()
		if (!this.childs) {
			const response = await fetch(`${this.repoBase()}/${this.path}`)
			const gitTreeEntries: GitTreeEntry[] = await response.json()
			const childs: GitTreeNodeMap = new Map()
			gitTreeEntries.forEach(gitTreeEntry =>
				childs.set(gitTreeEntry.name, new GitTreeNodeImpl(this.repoBase, gitTreeEntry.path, gitTreeEntry.type)))
			this.childs = childs
		}
		return this.childs
	}
}

/**
 * GitTree holds a tree structure that mirrors/caches the file tree of a git repository.
 * It lazy loads the nodes from the git server when they get accessed.
 */
export class GitTree {
	private repo: string
	private ref: string
	private root: GitTreeNode

	constructor(repo: string, ref: string) {
		this.repo = repo
		this.ref = ref
		this.root = new GitTreeNodeImpl(this.getRepoBase.bind(this), "", GitTreeEntryType.Directory)
	}

	private getRepoBase() {
		return `/api/repos/${this.repo}/refs/${this.ref}`
	}

	getRoot() {
		return this.root
	}

	async treeNodeAtPath(path: string) {
		let node: GitTreeNode = this.root
		const pathSegments = normalize(path).split('/').filter(segment => (segment.length > 0))
		for (const pathSegment of pathSegments) {
			const childs = await node.fetchChilds()
			const childNode = childs.get(pathSegment)
			if (!childNode) return Promise.reject()
			node = childNode
		}
		return node
	}

	async contentAtPath(path: string) {
		const node = await this.treeNodeAtPath(path)
		if (node && node.isFile) {
			const response = await fetch (`${this.getRepoBase()}/${node.getPath()}`)
			const content = await response.text()
			return content
		}
		return Promise.reject()
	}
}
