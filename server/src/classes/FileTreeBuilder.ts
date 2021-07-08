import { FileTree, FileTreeNode } from './Types.js';
import { Tree as GitTree, TreeEntry as GitTreeEntry } from 'nodegit';

export default class FileTreeBuilder {

	private static createFileTreeNode = (treeEntry: GitTreeEntry) => {
		const node: FileTreeNode = {
			object: {
				name: treeEntry.name(),
				sha: treeEntry.sha()
			}
		};
		return node;
	};

	private static async collectFileTreeNodes(tree: GitTree): Promise<FileTreeNode[]> {
		const fileTreeNodes: FileTreeNode[] = [];
		const promises: Promise<FileTreeNode[]>[] = [];

		tree.entries().forEach(treeEntry => {
			const fileTreeNode = this.createFileTreeNode(treeEntry);
			fileTreeNodes.push(fileTreeNode);
			if (treeEntry.isDirectory()) {
				promises.push(treeEntry.getTree()
				.then(childTree => FileTreeBuilder.collectFileTreeNodes(childTree))
				.then(childs => fileTreeNode.childs = childs));
			}
		});

		await Promise.all(promises);
		return fileTreeNodes;
	}

	static async build(tree: GitTree): Promise<FileTree> {
		const fileTreeNodes = await FileTreeBuilder.collectFileTreeNodes(tree);
		return new FileTree(fileTreeNodes);
	}
}
