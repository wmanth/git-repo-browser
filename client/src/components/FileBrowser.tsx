import React, { Component } from 'react'
import { Tree } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { DownOutlined } from '@ant-design/icons'
import FileTreeNode from '../common/FileTreeNode'
import "./FileBrowser.css"

interface FileBrowserProps {
	onSelect: (selectedKeys: any, info: any) => void
	fileTree?: FileTreeNode[]
}

interface FileBrowserState {
	treeData?: DataNode[]
}

export default class FileBrowser extends Component<FileBrowserProps, FileBrowserState> {
	state = { treeData: undefined }

	componentDidUpdate(prevProps: FileBrowserProps) {
		if (prevProps.fileTree !== this.props.fileTree) {
			this.updateTreeData()
		}
	}

	updateTreeData() {
		// converts a FileTreeNode as coming from the server into a DataNode as used by Ant.Tree
		const fromFileTreeNodeToDataNode = (node: FileTreeNode) => {
			const dataNode: DataNode = {
				title: node.name,
				key: node.sha,
				children: node.childs?.map(fromFileTreeNodeToDataNode)
			}
			return dataNode
		}

		this.setState({ treeData: this.props.fileTree?.map(fromFileTreeNodeToDataNode) })
	}

	render() {
		return (
			<Tree className="filebrowser"
				showLine
				switcherIcon = { <DownOutlined /> }
				onSelect = { this.props.onSelect }
				treeData = { this.state.treeData }
			/>
		)
	}
}
