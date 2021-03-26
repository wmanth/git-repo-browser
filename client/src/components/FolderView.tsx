import { Fragment, useContext, useEffect, useState } from 'react'
import { GitTreeNode } from '../common/GitTree'
import { FaFolder, FaFile } from 'react-icons/fa'
import { RepoViewerContext } from '../routes/RepoViewer'
import './FolderView.css'

const COLLAPSED = 'collapsed'
const COLLAPSE_DIRS = 'collapseDirs'
const COLLAPSE_FILES = 'collapseFiles'

interface FolderViewProps {
	node?: GitTreeNode
}

interface ItemProps {
	name: string
	node: GitTreeNode
}

export default function FolderView(props: FolderViewProps) {
	const [dirItems, setDirItems] = useState<JSX.Element[]>([])
	const [fileItems, setFileItems] = useState<JSX.Element[]>([])
	const [isCollapseDirs, collapseDirs] = useState(sessionStorage.getItem(COLLAPSE_DIRS) ? true : false)
	const [isCollapseFiles, collapseFiles] = useState(sessionStorage.getItem(COLLAPSE_FILES) ? true : false)
	const context = useContext(RepoViewerContext)

	async function getChildItems(node: GitTreeNode | undefined, test: (node: GitTreeNode) => boolean) {
		const items: JSX.Element[] = []
		const childs = await node?.fetchChilds()
		childs?.forEach((child: GitTreeNode, name: string) => {
			if (test(child)) items.push(<Item name={ name } node={ child } />)
		})
		return items
	}

	useEffect(() => {
		getChildItems(props.node, childNode => childNode.isFile()).then(items => setFileItems(items))
		getChildItems(props.node, childNode => childNode.isDirectory()).then(items => setDirItems(items))
	}, [props.node])

	const Item = (props: ItemProps) =>
		props.node.isFile() ? <FileItem name={ props.name } node={ props.node } /> :
		props.node.isDirectory() ? <DirectoryItem name={ props.name } node={ props.node } /> :
		<Fragment />

	const FileItem = (props: ItemProps) =>
		<li onClick={ () => context.selectNode(props.node) }>
			<FaFile color="lightgray" size={ 48 } />
			<div className="title">{ props.name }</div>
		</li>

	const DirectoryItem = (props: ItemProps) =>
		<li onClick={ () => context.selectNode(props.node) }>
			<FaFolder color="lightskyblue" size={ 48 } />
			<span className="title">{ props.name }</span>
		</li>

	const toggleDirsCollapse = () => {
		const collapse = !isCollapseDirs
		sessionStorage.setItem(COLLAPSE_DIRS, collapse ? COLLAPSED : '')
		collapseDirs(collapse)
	}

	const toggleFileCollapse = () => {
		const collapse = !isCollapseFiles
		sessionStorage.setItem(COLLAPSE_FILES, collapse ? COLLAPSED : '')
		collapseFiles(collapse)
	}

	const Directories = () => dirItems.length ? <Fragment>
		<header className={ isCollapseDirs ? COLLAPSED : undefined }>
			<span className="title" onClick={ toggleDirsCollapse }>Directories</span>
		</header>
		<ul className={ isCollapseDirs ? COLLAPSED : undefined}>{ dirItems }</ul>
		</Fragment> : <Fragment />

	const Files = () => fileItems.length ? <Fragment>
		<header className={ isCollapseFiles ? COLLAPSED : undefined }>
			<span className="title" onClick={ toggleFileCollapse }>Files</span>
		</header>
		<ul className={ isCollapseFiles ? COLLAPSED : undefined}>{ fileItems }</ul>
		</Fragment> : <Fragment />

	return <div className="folder-view">
		<Directories />
		<Files />
	</div>
}
