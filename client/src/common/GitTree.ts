import GitRepo, { GitRef, GitTreeEntry, GitTreeEntryType } from './GitRepo'
import { normalize } from 'path'

// tslint:disable:max-classes-per-file

export interface GitTreeNode {
	isFile(): boolean
	isDirectory(): boolean
	isSubmodule(): boolean
	getTree(): GitTree
	getPath(): string
	getName(): string
	getChilds(): GitTreeNodeMap | undefined
	fetchChilds(): Promise<GitTreeNodeMap>
}

export type GitTreeNodeMap = Map<string, GitTreeNode>

class GitTreeNodeImpl implements GitTreeNode {
	private tree: GitTree
	private path: string
	private type: GitTreeEntryType
	private childs?: GitTreeNodeMap

	constructor(tree: GitTree, path: string, type: GitTreeEntryType) {
		this.tree = tree
		this.path = path
		this.type = type
	}

	isFile = () => (this.type === GitTreeEntryType.File)
	isDirectory = () => (this.type === GitTreeEntryType.Directory)
	isSubmodule = () => (this.type === GitTreeEntryType.Submodule)
	getTree = () => this.tree
	getPath = () => this.path
	getChilds = () => this.childs
	getName = () => this.path.split('/').pop() || this.path

	async fetchChilds(): Promise<GitTreeNodeMap> {
		if (!this.isDirectory()) return Promise.reject(new Error(`Fetching childs from '${this.path}' not being a directory`))
		if (!this.childs) {
			const response = await this.tree.fetchPath(this.path)
			const gitTreeEntries: GitTreeEntry[] = await response.json()
			const childs: GitTreeNodeMap = new Map()
			gitTreeEntries.forEach(gitTreeEntry =>
				childs.set(gitTreeEntry.name, new GitTreeNodeImpl(this.tree, gitTreeEntry.path, gitTreeEntry.type)))
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
	private repo: GitRepo
	private ref: GitRef
	private root: GitTreeNode

	constructor(repo: GitRepo, ref: GitRef) {
		this.repo = repo
		this.ref = ref
		this.root = new GitTreeNodeImpl(this, "", GitTreeEntryType.Directory)
	}

	static async defaultTree(repo: GitRepo) {
		const ref = await repo.defaultBranch()
		return ref ? new GitTree(repo, ref) : undefined
	}

	getRoot = () => this.root
	getRepo = () => this.repo
	getRef = () => this.ref

	fetchPath = (path: string) => this.repo.fetchPath(this.ref, path)

	equals = (gitTree: GitTree) =>
		this.repo.getId() === gitTree.repo.getId() &&
		this.ref.refName === gitTree.ref.refName

	async treeNodeAtPath(path: string) {
		let node: GitTreeNode = this.root
		const pathSegments = normalize(path).split('/').filter(segment => (segment.length > 0))
		for (const pathSegment of pathSegments) {
			const childs = await node.fetchChilds()
			const childNode = childs.get(pathSegment)
			if (!childNode) return Promise.reject(new Error(`Node at '${path}' doesn't exist`))
			node = childNode
		}
		return node
	}

	async contentAtPath(path: string) {
		const node = await this.treeNodeAtPath(path)
		if (node && node.isFile) {
			const response = await this.fetchPath(node.getPath())
			const content = await response.text()
			return content
		}
		return Promise.reject()
	}
}
