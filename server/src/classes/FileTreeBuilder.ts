import FileTreeNode from '../common/FileTreeNode'
import { Tree, TreeEntry } from 'nodegit'

export default class FileTreeBuilder {

    private static createFileTreeNode = (treeEntry: TreeEntry) => {
        const node: FileTreeNode = {
            name: treeEntry.name(),
            path: treeEntry.path(),
            sha: treeEntry.sha()
        }
        return node
    }

    static async build(tree: Tree): Promise<FileTreeNode[]> {
        const fileTree = new Array<FileTreeNode>()
        const promises = new Array<Promise<FileTreeNode[]>>()

        tree.entries().forEach(treeEntry => {
            const fileTreeNode = this.createFileTreeNode(treeEntry)
            fileTree.push(fileTreeNode)
            if (treeEntry.isDirectory()) {
                promises.push(treeEntry.getTree()
                .then(childTree => FileTreeBuilder.build(childTree))
                .then(childs => fileTreeNode.childs = childs))
            }
        })

        await Promise.all(promises)
        return fileTree
    }
}
