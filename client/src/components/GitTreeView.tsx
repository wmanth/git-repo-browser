import { useState, useEffect, useContext, useCallback, createContext, Fragment } from "react"
import { GitTree, GitTreeNode, GitTreeNodeMap } from "../common/GitTree"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretRight, faFolder, faFolderOpen, faFile, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faGitSquare } from '@fortawesome/free-brands-svg-icons'
import { RepoViewerContext } from "../routes/RepoViewer"
import './GitTreeView.css'


interface GitTreeViewContextType {
	isExpanded: (node: GitTreeNode) => boolean
	onItemToggle: (node: GitTreeNode) => void
}

const defaultContext: GitTreeViewContextType = {
	isExpanded: () => false,
	onItemToggle: () => {},
}

const GitTreeViewContext = createContext<GitTreeViewContextType>(defaultContext)

/* --- CollapsibleIcon --- */

enum ExpandIconType {
	Empty, Collapsed, Expanded, Busy
}

interface CollapsibleIconProps {
	type: ExpandIconType
	onToggle?: () => void
}

function ExpandIcon(props: CollapsibleIconProps) {

	const Icon = () => {
		switch (props.type) {
			case ExpandIconType.Collapsed:
				return <FontAwesomeIcon icon={ faCaretRight } color="gray" />
			case ExpandIconType.Expanded:
				return <FontAwesomeIcon icon={ faCaretDown } color="gray" />
			case ExpandIconType.Busy:
				return <FontAwesomeIcon icon={ faSpinner } className="fa-spin" color="black" />
			default:
				return <Fragment />
		}
	}

	return <div className="git-tree-collapse-icon" onClick={ props.onToggle }><Icon /></div>
}

/* --- GitTreeViewItemGroup --- */

interface GitTreeViewItemGroupProps {
	nodeMap?: GitTreeNodeMap
}

function GitTreeViewItemGroup(props: GitTreeViewItemGroupProps) {

	const items = (nodeMap: GitTreeNodeMap) => {
		console.log('GitTreeViewItemGroup.items()')
		const childs: JSX.Element[] = []
		nodeMap.forEach((node, name) =>
			childs.push(
				<GitTreeViewItem
					key={ name }
					name={ name }
					node={ node } />))
		return childs
	}

	return props.nodeMap ? <ul className="git-tree-list">{ items(props.nodeMap) }</ul> : <Fragment />
}

/* --- GitTreeViewItem --- */

interface GitTreeViewItemProps {
	name: string
	node: GitTreeNode
}

function GitTreeViewItem(props: GitTreeViewItemProps) {
	const repoViewerContext = useContext(RepoViewerContext)
	const gitTreeViewContext = useContext(GitTreeViewContext)

	const [childNodes, setChildNodes] = useState(props.node.getChilds())
	const [expandIconType, setExpandIconType] = useState(props.node.isDirectory() ?
		gitTreeViewContext.isExpanded(props.node) ?
			ExpandIconType.Expanded :
			ExpandIconType.Collapsed :
		ExpandIconType.Empty)

	const handleSelect = () => repoViewerContext.selectNode(props.node)
	const handleToggle = () => gitTreeViewContext.onItemToggle(props.node)

	useEffect(() => {
		if (!props.node.isDirectory()) {
			setExpandIconType(ExpandIconType.Empty)
			setChildNodes(undefined)
		}
		else if (gitTreeViewContext.isExpanded(props.node)) {
			const childNodeMap = props.node.getChilds()
			if (childNodeMap) {
				setExpandIconType(ExpandIconType.Expanded)
				setChildNodes(childNodeMap)
			}
			else {
				setExpandIconType(ExpandIconType.Busy)
				props.node.fetchChilds()
				.then(nodeMap => {
					setExpandIconType(ExpandIconType.Expanded)
					setChildNodes(nodeMap)})
				.catch(reason => console.error(reason))
			}
		}
		else {
			setExpandIconType(ExpandIconType.Collapsed)
			setChildNodes(undefined)
		}
	}, [props.node, gitTreeViewContext])

	const ItemIcon = () => {
		const icon =
			props.node.isFile() ? <FontAwesomeIcon icon={ faFile } color="gray" /> :
			props.node.isSubmodule() ? <FontAwesomeIcon icon={ faGitSquare } color="coral" /> :
			props.node.isDirectory() ?
				gitTreeViewContext.isExpanded(props.node) ?
					<FontAwesomeIcon icon={ faFolderOpen } color="lightskyblue" /> :
					<FontAwesomeIcon icon={ faFolder } color="lightskyblue" /> :
				<Fragment />
		return <div className="git-tree-item-icon">{ icon }</div>
	}

	return (
		<Fragment>
			<li className="git-tree-list-item">
				<ExpandIcon type={ expandIconType } onToggle={ handleToggle } />
				<span className="item-label" onClick={ handleSelect } >
					<ItemIcon />
					<span>{ props.name }</span>
				</span>
			</li>
			<GitTreeViewItemGroup nodeMap={ childNodes }/>
		</Fragment>
	)
}

/* --- GitTreeView --- */

interface GitTreeViewProps {
	gitTree?: GitTree
}

export default function GitTreeView(props: GitTreeViewProps) {
	const [expandedList, setExpandedList] = useState<string[]>([])

	const handleIsExpanded = useCallback( (node: GitTreeNode) => {
		return expandedList.includes(node.path)
	}, [expandedList])

	const handleItemToggle = useCallback( (node: GitTreeNode) => {
		setExpandedList(list => list.includes(node.path) ?
			list.filter(item => item !== node.path) :
			list.concat(node.path))
	}, [])

	const context: GitTreeViewContextType = {
		isExpanded: handleIsExpanded,
		onItemToggle: handleItemToggle,
	}

	return props.gitTree ?
		<div className="git-tree">
			<GitTreeViewContext.Provider value={ context } >
				<GitTreeViewItem name="Source" node={ props.gitTree.root } />
			</GitTreeViewContext.Provider>
		</div> :
		<Fragment />
}
