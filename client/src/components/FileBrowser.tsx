import React, { Component } from 'react'
import { Tree } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { DownOutlined } from '@ant-design/icons'
import { GitTree, GitTreeNode } from '../common/GitTree'
import { SelectionHandler, UpdateTreeHandler } from '../App'
import "./FileBrowser.css"

interface FileBrowserProps {
	onSelect: SelectionHandler
	onUpdateTree: UpdateTreeHandler
	gitTree?: GitTree
}

interface FileBrowserState {
	treeData: DataNode[]
}

function addNodeElement(this: DataNode[], gitTreeNode: GitTreeNode, name: string) {
	const dataNode: DataNode = {
		title: name,
		key: gitTreeNode.getPath(),
		isLeaf: gitTreeNode.isFile(),
		disabled: gitTreeNode.isSubmodule()
	}
	const childs = gitTreeNode.getChilds()
	if (childs) {
		dataNode.children = []
		childs.forEach(addNodeElement, dataNode.children)
	}
	this.push(dataNode)
}

export default class FileBrowser extends Component<FileBrowserProps, FileBrowserState> {
	state = { treeData: [] }

	handleSelected(selectedKeys: any) {
		this.props.onSelect(selectedKeys[0])
	}

	componentDidUpdate(prevProps: FileBrowserProps) {
		if (prevProps.gitTree !== this.props.gitTree) {
			this.setState({ treeData: [] })
			this.updateTreeData()
		}
	}

	async updateTreeData() {
		const treeData: DataNode[] = []
		const rootChilds = await this.props.gitTree?.getRoot().fetchChilds()
		rootChilds?.forEach(addNodeElement, treeData)
		this.setState({ treeData: treeData })
	}

	async handleLoadData(dataTreeNode: DataNode) {
		if (this.props.gitTree) {
			const node = await this.props.gitTree.treeNodeAtPath(dataTreeNode.key.toString())
			await node.fetchChilds()
		}
		return this.updateTreeData()
	}

	render() {
		return (
			<Tree className="filebrowser"
				showLine
				switcherIcon = { <DownOutlined /> }
				onSelect = { this.handleSelected.bind(this) }
				loadData = { this.handleLoadData.bind(this) }
				treeData = { this.state.treeData }
			/>
		)
	}
}
