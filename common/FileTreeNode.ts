export default interface FileTreeNode {
    name: string
    path: string
    sha: string
    childs?: FileTreeNode[]
}
