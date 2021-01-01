// tslint:disable:max-classes-per-file

import IndexPath from "./IndexPath"

// see: https://stackoverflow.com/questions/15877362/declare-and-initialize-a-dictionary-in-typescript
export interface Dictionary<T> {
	[key: string]: T
}

export interface TreeNode<T> {
	object: T
	childs?: TreeNode<T>[]
}

export class Tree<T> {
	childs: TreeNode<T>[] = []

	static empty: Tree<any> = new Tree([])

	constructor(objects: TreeNode<T>[]) {
		this.childs = objects
	}

	objectAtIndexPath(indexPath: IndexPath): T | undefined {
		let treeNode: TreeNode<T> | undefined
		let childs: TreeNode<T>[] | undefined = this.childs
		for (const index of indexPath.getIndexes()) {
			treeNode = childs && childs[index]
			childs = treeNode?.childs
		}
		return treeNode?.object
	}
}

export interface GitBlob {
	name: string
	sha: string
}

export class FileTree extends Tree<GitBlob> {}
export type FileTreeNode = TreeNode<GitBlob>
