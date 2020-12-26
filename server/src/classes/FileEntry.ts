import { Tree, TreeEntry } from 'nodegit'

export class FileEntry {
    path: string
    sha: string

    constructor(treeEntry: TreeEntry) {
        this.path = treeEntry.path()
        this.sha = treeEntry.sha()
    }

    static async parseTree(tree: Tree): Promise<FileEntry[]> {
        const promises = new Array<Promise<FileEntry[]>>()
        let fileEntries = new Array<FileEntry>()

        tree.entries().forEach(treeEntry => {
            if (treeEntry.isFile()) {
                fileEntries.push(new FileEntry(treeEntry))
            }
            else if (treeEntry.isDirectory()) {
                promises.push(treeEntry.getTree().then(childTree => this.parseTree(childTree)))
            }
        })
        const allChildEntries = await Promise.all(promises)
        allChildEntries.forEach(childEntries => { fileEntries = fileEntries.concat(childEntries) })

        return fileEntries
    }
}
