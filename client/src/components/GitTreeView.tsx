import { useEffect, useState, Fragment } from "react";
import { GitTree, GitTreeNode, GitTreeNodeMap } from "../common/GitTree";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretRight, faFolder, faFolderOpen, faFile } from '@fortawesome/free-solid-svg-icons'
import { faGitSquare } from '@fortawesome/free-brands-svg-icons'
import { SelectionHandler } from "../App";
import './GitTreeView.css'


type ItemSelectionHandler = (node: GitTreeNode) => void

/* --- CollapsibleIcon --- */

interface CollapsibleIconProps {
	node: GitTreeNode
	onToggle: (expanded: boolean) => void
}

function CollapsibleIcon(props: CollapsibleIconProps) {
	const [expanded, setExpanded] = useState(false)

	const handleClick = () => {
		if (props.node.isDirectory()) {
			const newExpanded = !expanded
			setExpanded(newExpanded)
			props.onToggle(newExpanded)
		}
	}

	const icon = () => props.node.isDirectory() ?
		expanded ?
			<FontAwesomeIcon icon={ faCaretDown} color="gray"/> :
			<FontAwesomeIcon icon={ faCaretRight} color="gray"/> :
		<Fragment />

	return <div className="git-tree-collapse-icon" onClick={ handleClick }>{ icon() }</div>
}

/* --- GitTreeViewItemGroup --- */

interface GitTreeViewItemGroupProps {
	node: GitTreeNode
	onItemSelect: ItemSelectionHandler
}

function GitTreeViewItemGroup(props: GitTreeViewItemGroupProps) {
	const [items, setItems] = useState<JSX.Element[]>([])

	useEffect(() => {
		const nodeMapToItems = (nodeMap: GitTreeNodeMap) => {
			const childs: JSX.Element[] = []
			nodeMap.forEach((node, name) =>
				childs.push(<GitTreeViewItem key={ name } name={ name } node={ node } onSelect={ props.onItemSelect } />))
			return childs
		}

		const childNodeMap = props.node.getChilds()
		if (childNodeMap) setItems(nodeMapToItems(childNodeMap))
		else {
			props.node.fetchChilds()
			.then(nodeMap => setItems(nodeMapToItems(nodeMap)))
		}
	}, [props.node, props.onItemSelect])

	return <ul>{ items }</ul>
}

/* --- GitTreeViewItem --- */

interface GitTreeViewItemProps {
	name: string
	node: GitTreeNode
	onSelect: ItemSelectionHandler
}

function GitTreeViewItem(props: GitTreeViewItemProps) {
	const [expanded, setExpanded] = useState(false)

	console.log(`rendering item '${props.node.getPath()}' which is ${expanded ? "expanded" : "collapsed"}`)

	const handleSelect = () => props.onSelect(props.node)
	const handleToggle = (expanded: boolean) => { console.log(`setting '${props.node.getPath()}' to ${expanded ? "expanded" : "collapsed"}`); setExpanded(expanded) }

	const ItemIcon = () => {
		const icon =
			props.node.isFile() ? <FontAwesomeIcon icon={ faFile } color="gray" /> :
			props.node.isSubmodule() ? <FontAwesomeIcon icon={ faGitSquare } color="coral" /> :
			props.node.isDirectory() ?
				expanded ?
					<FontAwesomeIcon icon={ faFolderOpen } color="lightskyblue" /> :
					<FontAwesomeIcon icon={ faFolder } color="lightskyblue" /> :
			<Fragment />
		return <div className="git-tree-item-icon">{ icon }</div>
	}

	const ChildItems = () => expanded ?
		<GitTreeViewItemGroup node={ props.node } onItemSelect={ props.onSelect } /> :
		<Fragment />

	return (
		<Fragment>
			<li>
				<CollapsibleIcon node={ props.node } onToggle={ handleToggle } />
				<span className="item-label" onClick={ handleSelect } >
					<ItemIcon />
					<span>{ props.name }</span>
				</span>
			</li>
			<ChildItems />
		</Fragment>
	)
}

/* --- GitTreeView --- */

interface GitTreeViewProps {
	gitTree?: GitTree
	onSelect?: SelectionHandler
}

export default function GitTreeView(props: GitTreeViewProps) {

	const handleItemSelect = (node: GitTreeNode) => {
		if (props.onSelect) props.onSelect(node)
	}

	return props.gitTree ?
		<div className="git-tree">
			<GitTreeViewItemGroup node={ props.gitTree.getRoot() } onItemSelect={ handleItemSelect } />
		</div> :
		<Fragment />
}
