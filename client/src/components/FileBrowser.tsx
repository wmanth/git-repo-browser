import React, { Component } from 'react'
import { Tree } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { DownOutlined } from '@ant-design/icons'
import FileTreeNode from '../common/FileTreeNode'
import { fetchFileTree } from '../classes/RepoFetcher'
import "./FileBrowser.css"

interface FileBrowserProps {
	onSelect: (selectedKeys: any, info: any) => void
	repo: string
	tag: string
}

interface FileBrowserState {
	treeData?: DataNode[]
}

export default class FileBrowser extends Component<FileBrowserProps, FileBrowserState> {
	state = { treeData: undefined }
	
	componentDidUpdate(prevProps: FileBrowserProps) {
		if (this.props.repo !== prevProps.repo || this.props.tag !== prevProps.tag) {
			this.updateTreeData()
		}
	}

	updateTreeData() {
		// converts a FileTreeNode as coming from the server into a DataNode as used by Ant.Tree
		const fromFileTreeNodeToDataNode = (node: FileTreeNode) => {
			const dataNode: DataNode = {
				title: node.name,
				key: node.sha,
				children: node.childs && node.childs.map(fromFileTreeNodeToDataNode)
			}
			return dataNode
		}

		if (!this.props.repo || !this.props.tag) {
			this.setState({ treeData: undefined })
		}
		else {
			fetchFileTree(this.props.repo, this.props.tag)
			.then(fileTree => this.setState({ treeData: fileTree.map(fromFileTreeNodeToDataNode) }))
			.catch(reason => console.error(reason))
		}
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
