import { useContext, useEffect, useState } from 'react'
import { RepoViewerContext } from '../routes/RepoViewer'
import { GitTreeNode } from '../common/GitTree'
import './FileNavigator.css'

interface BreadcrumbProps {
	node: GitTreeNode
}

function Breadcrumb(props: BreadcrumbProps) {
	const context = useContext(RepoViewerContext)

	const handleClick = () => {
		context.selectNode(props.node)
	}

	return <li
		onClick={ handleClick }
		className="breadcrumb">
			{ props.node.getName() }
	</li>
}

interface FileNavigatorProps {
	node?: GitTreeNode
}

export default function FileNavigator(props: FileNavigatorProps) {
	const [nodes, setNodes] = useState<GitTreeNode[]>([])

	useEffect(() => {
		const nodes: GitTreeNode[] = []
		if (props.node) {
			const nodePathSegments = props.node.path.split('/')
			var nodeSegment: string | undefined
			var parentNode = props.node.tree.root

			while ((nodeSegment = nodePathSegments.shift())) {
				const node = parentNode.getChilds()?.get(nodeSegment)
				if (node) {
					nodes.push(node)
					parentNode = node
				}
			}
		}
		setNodes(nodes)
	}, [props.node])

	return <ul className="breadcrumb-trail">
		{ nodes.map(node => <Breadcrumb key={ node.path } node={ node } />) }
	</ul>
}
