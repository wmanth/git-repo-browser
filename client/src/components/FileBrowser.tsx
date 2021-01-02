import React, { Component } from 'react'
import { Tree } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { DownOutlined } from '@ant-design/icons'
import { FileTree, FileTreeNode } from '../common/Types'
import "./FileBrowser.css"
import { selectionHandler } from '../App'

interface FileBrowserProps {
	onSelect: selectionHandler
	fileTree?: FileTree
}

interface FileBrowserState {
	treeData?: DataNode[]
}

export default class FileBrowser extends Component<FileBrowserProps, FileBrowserState> {
	state = { treeData: undefined }

	handleSelected(selectedKeys: any) {
		this.props.onSelect(selectedKeys[0])
	}

	componentDidUpdate(prevProps: FileBrowserProps) {
		if (prevProps.fileTree !== this.props.fileTree) {
			this.updateTreeData()
		}
	}

	updateTreeData() {
		let indexPath: number[] = []

		// converts a FileTreeNode as coming from the server into a DataNode as used by Ant.Tree
		const fromFileTreeNodeToDataNode = (fileTreeNode: FileTreeNode, index: number) => {
			indexPath.push(index)
			const dataNode: DataNode = {
				title: fileTreeNode.object.name,
				key: indexPath.join('-'),
				children: fileTreeNode.childs?.map(fromFileTreeNodeToDataNode)
			}
			indexPath.pop()
			return dataNode
		}

		this.setState({ treeData: this.props.fileTree?.childs.map(fromFileTreeNodeToDataNode) })
	}

	render() {
		return (
			<Tree className="filebrowser"
				showLine
				switcherIcon = { <DownOutlined /> }
				onSelect = { this.handleSelected.bind(this) }
				treeData = { this.state.treeData }
			/>
		)
	}
}
