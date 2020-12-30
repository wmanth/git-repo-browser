import React, { Component } from 'react'
import Layout, { Content, Header } from 'antd/lib/layout/layout'
import FileTreeNode from '../common/FileTreeNode'
import CodeViewer from './CodeViewer'
import { Dictionary } from '../common/Types'
import { fetchContent } from '../utils/RepoFetcher'
import './Workspace.css'

interface BlobInfo {
	path: string
}

interface WorkspaceProps {
	repo?: string
	fileTree?: FileTreeNode[]
	selected?: string
}

interface WorkspaceState {
	content?: string
	blobDict?: Dictionary<BlobInfo>
}

export default class Workspace extends Component<WorkspaceProps, WorkspaceState> {
	state = { content: "Hello Yulie!" }

	componentDidUpdate(prevProps: WorkspaceProps) {
		if (prevProps.fileTree !== this.props.fileTree) {
			this.updateBlobDict()
		}
		else if (prevProps.selected !== this.props.selected) {
			this.updateSelected()
		}
	}

	updateSelected() {
		if (this.props.repo && this.props.selected) {
			fetchContent(this.props.repo, this.props.selected)
			.then(content => this.setState({ content: content}))
			.catch(err => console.error(err));
		}
	}

	updateBlobDict() {
		var blobDict: Dictionary<BlobInfo> = {};
		const addBlob = (node: FileTreeNode) => {
			blobDict[node.sha] = { path: node.path }
			node.childs?.forEach(addBlob)
		}
		this.props.fileTree?.forEach(addBlob)
		this.setState({ blobDict: blobDict })
	}

	render() {
		return (
			<Layout style={{ position: "fixed", width: "100%", height: "100%" }}>
				<Header className="breadcrumb" />
				<Content style={{ width: "100%", height: "100%" }}>
					<CodeViewer content={ this.state.content } />
				</Content>
			</Layout>
		)
	}
}
