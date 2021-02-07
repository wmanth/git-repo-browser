import { useEffect, useState } from 'react'
import { GitTreeNode } from '../common/GitTree'
import './FileNavigator.css'

interface FileNavigatorProps {
	node?: GitTreeNode
}

export default function FileNavigator(props: FileNavigatorProps) {
	const [nodes, setNodes] = useState<GitTreeNode[]>([])

	useEffect(() => {
		const nodes: GitTreeNode[] = []
		if (props.node) {
			const nodePathSegments = props.node.getPath().split('/')
			var nodeSegment: string | undefined
			var parentNode = props.node.getTree().getRoot()

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
		{ nodes.map(node => <li key={ node.getPath() } className="breadcrumb">{ node.getName() }</li>) }
	</ul>
}
